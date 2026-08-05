import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Paths maintenance mode never touches — admin needs the real site to
// verify changes, API routes have their own auth, and /maintenance itself
// must stay reachable or the rewrite below would loop.
function isExemptFromMaintenance(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname === "/maintenance"
  );
}

// Refreshes the Supabase auth session cookie on every request. Without this,
// a logged-in admin's session silently expires — Server Components can only
// read cookies, they can't refresh and re-set an expiring one themselves.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touches the session so expiring tokens get refreshed before Server
  // Components render (they can only read cookies, not write new ones).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Maintenance mode must be enforced here rather than in a page/layout —
  // several shop pages are statically cached (ISR), and a per-user "is this
  // an admin" check baked into cached HTML would leak one visitor's bypass
  // onto everyone else until the next revalidation. Middleware always runs
  // per-request before any cache is served, so this stays correct.
  if (!isExemptFromMaintenance(request.nextUrl.pathname)) {
    const { data: settings } = await supabase
      .from("shop_settings")
      .select("maintenance_mode")
      .single();

    if (settings?.maintenance_mode) {
      let isAdmin = false;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();
        isAdmin = profile?.is_admin ?? false;
      }

      if (!isAdmin) {
        return NextResponse.rewrite(new URL("/maintenance", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)",
  ],
};
