export const metadata = {
  title: "นโยบายความเป็นส่วนตัว | A GLEAM",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-semibold text-shop-text">
        นโยบายความเป็นส่วนตัว
      </h1>
      <p className="mt-1 text-sm text-shop-text-soft">
        A GLEAM | อะ - กลีม — ปรับปรุงล่าสุด 23 กรกฎาคม 2569
      </p>

      <div className="mt-6 space-y-6 rounded-2xl bg-white p-6 text-sm leading-relaxed text-shop-text shadow-sm ring-1 ring-shop-blush-100">
        <section>
          <h2 className="font-semibold">ข้อมูลที่เราเก็บ</h2>
          <p className="mt-1 text-shop-text-soft">
            เมื่อคุณสั่งซื้อสินค้าหรือสมัครสมาชิก เราเก็บข้อมูลเท่าที่จำเป็นสำหรับการจัดส่งและติดต่อกลับ
            ได้แก่ ชื่อ-นามสกุล เบอร์โทร ที่อยู่จัดส่ง อีเมล รูปสลิปโอนเงิน และประวัติคำสั่งซื้อ
            หากสมัครสมาชิกด้วยรูปโปรไฟล์ เราจะเก็บรูปนั้นไว้ด้วย
          </p>
        </section>

        <section>
          <h2 className="font-semibold">เราใช้ข้อมูลอย่างไร</h2>
          <p className="mt-1 text-shop-text-soft">
            ใช้เพื่อดำเนินการตามคำสั่งซื้อ จัดส่งสินค้า ตรวจสอบการชำระเงิน ติดต่อกลับกรณีมีปัญหาเกี่ยวกับ
            ออเดอร์ และจดจำที่อยู่ไว้ให้กรอกอัตโนมัติในครั้งถัดไปหากสมัครสมาชิก เราไม่นำข้อมูลไปขาย
            หรือส่งต่อให้บุคคลภายนอกเพื่อการโฆษณา
          </p>
        </section>

        <section>
          <h2 className="font-semibold">การล็อกอินผ่านบุคคลภายนอก</h2>
          <p className="mt-1 text-shop-text-soft">
            หากคุณเลือกสมัครสมาชิก/ล็อกอินผ่าน Google หรือ Facebook เราจะได้รับแค่ชื่อและอีเมลที่บัญชีนั้น
            อนุญาตให้เข้าถึงเท่านั้น เพื่อใช้สร้างบัญชีสมาชิกกับเรา ไม่ได้เข้าถึงข้อมูลอื่นในบัญชี Google/Facebook
            ของคุณ
          </p>
        </section>

        <section>
          <h2 className="font-semibold">ผู้ให้บริการที่เราใช้</h2>
          <p className="mt-1 text-shop-text-soft">
            เราจัดเก็บข้อมูลและรูปภาพผ่าน Supabase (ฐานข้อมูลและที่เก็บไฟล์ตั้งอยู่ตามมาตรฐานของผู้ให้บริการ)
            รูปสลิปโอนเงินเก็บไว้ในที่เก็บไฟล์แบบส่วนตัว มีเพียงเจ้าของร้านเท่านั้นที่เข้าถึงได้
          </p>
        </section>

        <section>
          <h2 className="font-semibold">สิทธิ์ของคุณ</h2>
          <p className="mt-1 text-shop-text-soft">
            คุณสามารถขอดู แก้ไข หรือขอให้ลบข้อมูลส่วนตัวของคุณได้ทุกเมื่อ — ดูวิธีขอลบข้อมูลได้ที่หน้า{" "}
            <a href="/data-deletion" className="text-shop-blush-600 underline">
              การลบข้อมูลผู้ใช้
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-semibold">ติดต่อเรา</h2>
          <p className="mt-1 text-shop-text-soft">
            หากมีคำถามเกี่ยวกับความเป็นส่วนตัว ติดต่อผ่าน{" "}
            <a
              href="https://line.me/R/ti/p/@bod3027v"
              target="_blank"
              rel="noopener noreferrer"
              className="text-shop-blush-600 underline"
            >
              LINE ร้าน
            </a>{" "}
            หรือ{" "}
            <a
              href="https://www.facebook.com/agleamin3011"
              target="_blank"
              rel="noopener noreferrer"
              className="text-shop-blush-600 underline"
            >
              Facebook เพจร้าน
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
