export default function Footer() {
  return (
    <footer className="mt-16 border-t border-shop-blush-100 bg-shop-blush-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-sm text-shop-text sm:grid-cols-2">
        <div>
          <p className="font-semibold tracking-wide">CUSTOMER SERVICE</p>
          <p className="mt-2 text-shop-text-soft">
            ติดต่อร้าน A GLEAM | อะ - กลีม
          </p>
          <p className="text-shop-text-soft">โทร: 08x-xxx-xxxx (ตัวอย่าง)</p>
          <p className="text-shop-text-soft">
            อีเมล: hello@agleam.example (ตัวอย่าง)
          </p>
        </div>

        <div className="sm:text-right">
          <p className="font-semibold tracking-wide">SOCIAL MEDIA</p>
          <div className="mt-2 flex gap-4 sm:justify-end">
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
              href="#"
              aria-label="Facebook (เร็วๆ นี้)"
              className="text-shop-text-soft transition-colors hover:text-shop-blush-600"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M13.5 21v-7.8h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.5-1.46h1.6V4.3c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.42-3.9 4V10.2H7.7v3h2.66V21h3.14Z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="TikTok (เร็วๆ นี้)"
              className="text-shop-text-soft transition-colors hover:text-shop-blush-600"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M16.5 2h-3v13.2a2.6 2.6 0 1 1-2-2.53V9.6a5.6 5.6 0 1 0 5 5.57V9.1a7.6 7.6 0 0 0 4.5 1.47V7.5a4.6 4.6 0 0 1-4.5-4.5Z" />
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
