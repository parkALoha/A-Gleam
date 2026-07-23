"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Provider } from "@supabase/supabase-js";

const PROVIDERS: { provider: Provider; label: string; icon: React.ReactNode }[] = [
  {
    provider: "google",
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z" />
        <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 015.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.94l3.66-2.85z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z" />
      </svg>
    ),
  },
  {
    provider: "facebook",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2" aria-hidden>
        <path d="M13.5 21v-7.8h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.5-1.46h1.6V4.3c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.42-3.9 4V10.2H7.7v3h2.66V21h3.14Z" />
      </svg>
    ),
  },
];

export default function SocialAuthButtons({
  callbackParams,
}: {
  callbackParams?: Record<string, string>;
}) {
  async function handleClick(provider: Provider) {
    const supabase = createBrowserSupabaseClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    for (const [key, value] of Object.entries(callbackParams ?? {})) {
      redirectTo.searchParams.set(key, value);
    }
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo.toString() },
    });
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {PROVIDERS.map(({ provider, label, icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => handleClick(provider)}
          className="flex items-center justify-center gap-2 rounded-full border border-shop-blush-100 bg-white px-3 py-2 text-sm text-shop-text transition-colors hover:bg-shop-blush-50"
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}
