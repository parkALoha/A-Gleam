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
  {
    provider: "apple",
    label: "Apple",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#000" aria-hidden>
        <path d="M16.365 1.43c0 1.14-.416 2.06-1.25 2.86-.858.79-1.83 1.24-2.89 1.15-.12-1.09.42-2.06 1.24-2.85.85-.8 1.9-1.25 2.9-1.16Zm2.86 17.16c-.53 1.22-.79 1.77-1.47 2.85-.96 1.5-2.32 3.38-4 3.4-1.49.02-1.87-.98-3.9-.97-2.02.01-2.45.99-3.94.97-1.68-.02-2.96-1.7-3.92-3.19C-.13 17.5-.6 13.02 1.19 10.4c1.09-1.6 2.71-2.55 4.31-2.55 1.62 0 2.65.99 3.94.99 1.24 0 2.06-1 3.94-1 1.16 0 2.6.65 3.6 1.79-3.15 1.87-2.65 6.15.23 8.96Z" />
      </svg>
    ),
  },
  {
    provider: "custom:line" as Provider,
    label: "LINE",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#06C755" aria-hidden>
        <path d="M12 2C6.48 2 2 5.66 2 10.2c0 4.06 3.58 7.46 8.42 8.1.33.07.77.22.88.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1 .87.55 1.07-.46 5.77-3.4 7.87-5.83C21.14 13.5 22 11.94 22 10.2 22 5.66 17.52 2 12 2Z" />
      </svg>
    ),
  },
];

export default function SocialAuthButtons() {
  async function handleClick(provider: Provider) {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
