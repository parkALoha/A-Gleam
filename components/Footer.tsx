export default function Footer() {
  return (
    <footer className="mt-16 border-t border-shop-blush-100 bg-shop-blush-100">
      <div className="mx-auto max-w-6xl px-5 py-10 text-center text-sm text-shop-text">
        <div>
          <p className="font-semibold tracking-wide">SOCIAL MEDIA</p>
          <div className="mt-2 flex justify-center gap-4">
            <a
              href="https://www.instagram.com/agleamin3011/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-shop-text-soft transition-colors hover:text-shop-blush-600"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2.1.24 2.6.44a5.2 5.2 0 0 1 1.9 1.24 5.2 5.2 0 0 1 1.23 1.9c.2.5.38 1.4.44 2.6.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.24 2.1-.44 2.6a5.2 5.2 0 0 1-1.24 1.9 5.2 5.2 0 0 1-1.9 1.23c-.5.2-1.4.38-2.6.44-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-2.1-.24-2.6-.44a5.2 5.2 0 0 1-1.9-1.24 5.2 5.2 0 0 1-1.23-1.9c-.2-.5-.38-1.4-.44-2.6C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.24-2.1.44-2.6a5.2 5.2 0 0 1 1.24-1.9A5.2 5.2 0 0 1 5.85 1.4c.5-.2 1.4-.38 2.6-.44C9.75 2.2 10.15 2.2 12 2.2Zm0 3a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6Zm0 11.2a4.4 4.4 0 1 1 0-8.8 4.4 4.4 0 0 1 0 8.8Zm7-11.4a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0Z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/agleamin3011"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-shop-text-soft transition-colors hover:text-shop-blush-600"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M13.5 21v-7.8h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.5-1.46h1.6V4.3c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.42-3.9 4V10.2H7.7v3h2.66V21h3.14Z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@agleamin3011"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-shop-text-soft transition-colors hover:text-shop-blush-600"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M16.5 2h-3v13.2a2.6 2.6 0 1 1-2-2.53V9.6a5.6 5.6 0 1 0 5 5.57V9.1a7.6 7.6 0 0 0 4.5 1.47V7.5a4.6 4.6 0 0 1-4.5-4.5Z" />
              </svg>
            </a>
            <a
              href="https://line.me/R/ti/p/@bod3027v"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LINE"
              className="text-shop-text-soft transition-colors hover:text-shop-blush-600"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M12 2C6.48 2 2 5.66 2 10.2c0 4.06 3.58 7.46 8.42 8.1.33.07.77.22.88.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1 .87.55 1.07-.46 5.77-3.4 7.87-5.83C21.14 13.5 22 11.94 22 10.2 22 5.66 17.52 2 12 2Zm-3.3 10.7H6.9a.42.42 0 0 1-.42-.42V8.02c0-.24.19-.42.42-.42.24 0 .42.19.42.42v3.85h2.38c.24 0 .42.19.42.42 0 .24-.18.42-.42.42Zm2.02 0c-.24 0-.42-.19-.42-.42V8.02c0-.24.19-.42.42-.42.24 0 .42.19.42.42v4.26c0 .24-.19.42-.42.42Zm5.02 0c-.13 0-.25-.06-.33-.15l-2.1-2.84v2.57c0 .24-.19.42-.42.42-.24 0-.42-.19-.42-.42V8.02c0-.19.12-.35.3-.4.18-.06.37 0 .48.16l2.1 2.84V8.02c0-.24.19-.42.42-.42.24 0 .42.19.42.42v4.26c0 .19-.12.36-.3.4a.4.4 0 0 1-.15.02Zm3.94-3.02c.24 0 .42.19.42.42 0 .24-.19.42-.42.42h-1.96v1.36h1.96c.24 0 .42.19.42.42 0 .24-.19.42-.42.42h-2.38a.42.42 0 0 1-.42-.42V8.02c0-.24.19-.42.42-.42h2.38c.24 0 .42.19.42.42 0 .24-.19.42-.42.42h-1.96v1.24h1.96Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-shop-blush-200 py-4 text-center text-xs text-shop-text-soft">
        © {new Date().getFullYear()} A GLEAM | อะ - กลีม สงวนลิขสิทธิ์
      </div>
    </footer>
  );
}
