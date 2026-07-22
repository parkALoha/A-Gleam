@AGENTS.md

# A GLEAM | อะ - กลีม — โปรเจกต์เว็บร้านเสื้อผู้หญิง

## ภาพรวม
เว็บอีคอมเมิร์ซสำหรับร้านเสื้อผู้หญิง "A GLEAM" (IG: @agleamin3011) สร้างด้วย Next.js 16 (App Router) +
Tailwind CSS v4 + Supabase (ฐานข้อมูล/ที่เก็บไฟล์/ระบบล็อกอิน) ขายเสื้อไซส์เดียว ชำระเงินแบบโอน+แนบสลิป
(ไม่มีเกตเวย์จ่ายเงินอัตโนมัติ) ตรวจสลิปด้วย Slip2Go

**แผนงานฉบับเต็ม (เฟส/สถานะ/เหตุผลการตัดสินใจ) อยู่ที่:**
`/Users/park/.claude/plans/valiant-toasting-globe.md` — อ่านไฟล์นี้ก่อนเริ่มงานใหม่ทุกครั้ง
เพื่อดูว่าตอนนี้ทำถึงเฟสไหนแล้ว และมีดีเทลอะไรที่ตัดสินใจไว้แล้วบ้าง

## รันโปรเจกต์
```
npm run dev     # เปิดเว็บที่ localhost:3000
npm run lint    # ตรวจ ESLint ก่อน commit/ก่อนบอกว่าเสร็จเสมอ
```

## โครงสร้างไฟล์หลัก
- `app/` — หน้าเว็บ (App Router): หน้าแรก, `/products/[slug]`, `/cart`, `/checkout`, `/checkout/confirmation/[orderNumber]`
- `components/` — UI ทั้งหมด (Header, HeroBanner, ProductCard, ProductGallery, CheckoutForm ฯลฯ)
- `context/CartContext.tsx` — state ตะกร้าสินค้า (client-side, เก็บใน localStorage)
- `lib/` — โค้ดฝั่งเซิร์ฟเวอร์: `lib/products.ts`, `lib/shop-settings.ts`, `lib/reviews.ts` (DAL อ่านข้อมูล),
  `lib/supabase/{public,server,service}.ts` (3 client แยกตามระดับสิทธิ์ — ดูหมายเหตุด้านล่าง)
- `supabase/migrations/*.sql` — ไฟล์ SQL ที่ต้องรันเองใน Supabase Dashboard → SQL Editor (รันเรียงเลขไฟล์)
  **ผมไม่มีสิทธิ์รัน SQL ตรงๆ ต้องขอให้ผู้ใช้ copy-paste รันเองทุกครั้งที่เพิ่ม migration ใหม่**
- `scripts/*.mjs` — สคริปต์ one-off สำหรับ seed/แก้ข้อมูลตรงผ่าน service-role key
  (รันด้วย `node --experimental-websocket --env-file=.env.local scripts/ชื่อไฟล์.mjs` —
  ต้องมี `--experimental-websocket` เพราะ Node 20 ยังไม่มี global WebSocket ที่ @supabase/supabase-js ต้องใช้)
- `.env.local` — เก็บกุญแจ Supabase/Slip2Go ทั้งหมด (gitignored ห้าม commit)

## Supabase — 3 client แยกตามหน้าที่ (สำคัญ อย่าใช้สลับกัน)
- `lib/supabase/public.ts` — อ่านข้อมูลสาธารณะ (สินค้า, shop_settings) ไม่ต้อง session
- `lib/supabase/server.ts` — รู้ session ของผู้ใช้ที่ล็อกอินอยู่ (ใช้ตรวจสิทธิ์แอดมิน)
- `lib/supabase/service.ts` — สิทธิ์เต็ม (bypass RLS) ใช้เฉพาะโค้ดฝั่งเซิร์ฟเวอร์ที่ต้องเขียนข้อมูล/อัปโหลดไฟล์
  เท่านั้น ห้ามส่ง key นี้ไปฝั่ง browser เด็ดขาด

## หมายเหตุสำคัญที่ตัดสินใจไว้แล้ว (อย่าย้อนแก้โดยไม่คุยกับผู้ใช้ก่อน)
- Next.js เวอร์ชันนี้ต่างจากที่เคยรู้จัก — อ่าน `node_modules/next/dist/docs/` ก่อนใช้ API ที่ไม่แน่ใจ
  (เช่น `middleware.ts` เปลี่ยนชื่อเป็น `proxy.ts`, `params`/`searchParams`/`cookies()` เป็น Promise ต้อง await)
- สินค้าไซส์เดียว ไม่มี size/color picker — ใช้ตารางขนาดตัว (`measurements`) แทน
- ราคาสินค้าคำนวณใหม่จากฐานข้อมูลเสมอตอน checkout (ห้ามเชื่อราคาที่ส่งมาจาก browser)
- สต็อกตัดตอนออเดอร์ถูก "ยืนยัน" เท่านั้น ไม่ใช่ตอนลูกค้ากดสั่งซื้อ
- โทนสีแบรนด์: ครีม/ชมพูฝุ่น (blush)/เขียวเซจ (sage)/ฟ้าพาวเดอร์ (powder) — กำหนดใน `app/globals.css`
  ผ่าน Tailwind v4 `@theme inline` (ไม่มีไฟล์ `tailwind.config.ts` แยก)
- ระบบสิทธิ์แอดมินตอนนี้ยังใช้ `auth.role() = 'authenticated'` (ใครล็อกอินได้ = แอดมิน) —
  **ต้องแก้เป็น `profiles.is_admin` ก่อนเปิดให้ลูกค้าสมัครสมาชิกได้จริง** (ดูแผนเฟส 5)
