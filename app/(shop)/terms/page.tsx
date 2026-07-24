export const metadata = {
  title: "ข้อกำหนดการใช้งาน | A GLEAM",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-semibold text-shop-text">ข้อกำหนดการใช้งาน</h1>
      <p className="mt-1 text-sm text-shop-text-soft">
        A GLEAM | อะ - กลีม — ปรับปรุงล่าสุด 25 กรกฎาคม 2569
      </p>

      <div className="mt-6 space-y-6 rounded-2xl bg-white p-6 text-sm leading-relaxed text-shop-text shadow-sm ring-1 ring-shop-blush-100">
        <section>
          <h2 className="font-semibold">การยอมรับข้อกำหนด</h2>
          <p className="mt-1 text-shop-text-soft">
            การใช้งานเว็บไซต์นี้ ไม่ว่าจะสั่งซื้อสินค้าหรือสมัครสมาชิก ถือว่าคุณยอมรับข้อกำหนดการใช้งานนี้
            และ{" "}
            <a href="/privacy-policy" className="text-shop-blush-600 underline">
              นโยบายความเป็นส่วนตัว
            </a>{" "}
            ของร้าน
          </p>
        </section>

        <section>
          <h2 className="font-semibold">สินค้าและราคา</h2>
          <p className="mt-1 text-shop-text-soft">
            สินค้าเป็นไซส์เดียว กรุณาตรวจสอบตารางขนาดตัวที่หน้าสินค้าก่อนสั่งซื้อทุกครั้ง ราคาที่แสดงบนเว็บไซต์
            เป็นราคาล่าสุด ณ เวลาที่ทำรายการ
          </p>
        </section>

        <section>
          <h2 className="font-semibold">การสั่งซื้อและชำระเงิน</h2>
          <p className="mt-1 text-shop-text-soft">
            ร้านรับชำระเงินด้วยการโอนเงินและแนบรูปสลิปเท่านั้น คำสั่งซื้อจะได้รับการยืนยันหลังทางร้านตรวจสอบ
            สลิปเรียบร้อย หากข้อมูลการชำระเงินไม่ถูกต้อง ร้านขอสงวนสิทธิ์ปฏิเสธคำสั่งซื้อนั้น
          </p>
        </section>

        <section>
          <h2 className="font-semibold">การจัดส่ง</h2>
          <p className="mt-1 text-shop-text-soft">
            ร้านจัดส่งสินค้าผ่านบริษัทขนส่งเอกชนตามที่อยู่ที่ลูกค้าระบุไว้ กรุณาตรวจสอบความถูกต้องของที่อยู่
            ก่อนยืนยันคำสั่งซื้อ ความล่าช้าที่เกิดจากบริษัทขนส่งอยู่นอกเหนือความรับผิดชอบของร้าน
          </p>
        </section>

        <section>
          <h2 className="font-semibold">การคืน/เปลี่ยนสินค้า</h2>
          <p className="mt-1 text-shop-text-soft">
            เนื่องจากร้านรับชำระเงินก่อนดำเนินการจัดส่งเสมอ โดยปกติร้านจึงไม่รับคืนหรือเปลี่ยนสินค้า
            ยกเว้นกรณีร้านจัดส่งสินค้าผิดรายการหรือสินค้ามีตำหนิจากการผลิต กรุณาติดต่อร้านภายใน 3 วัน
            หลังได้รับสินค้าพร้อมรูปถ่ายสินค้าประกอบ
          </p>
        </section>

        <section>
          <h2 className="font-semibold">บัญชีสมาชิก</h2>
          <p className="mt-1 text-shop-text-soft">
            คุณต้องให้ข้อมูลที่ถูกต้องตอนสมัครสมาชิก และรับผิดชอบในการเก็บรักษารหัสผ่านของตนเอง
            หากพบการใช้งานที่ไม่เหมาะสม ร้านขอสงวนสิทธิ์ระงับบัญชีนั้น
          </p>
        </section>

        <section>
          <h2 className="font-semibold">รีวิวลูกค้า</h2>
          <p className="mt-1 text-shop-text-soft">
            รีวิวที่ส่งเข้ามาจะได้รับการตรวจสอบก่อนแสดงบนหน้าเว็บไซต์ ร้านขอสงวนสิทธิ์ไม่แสดงรีวิวที่มีเนื้อหา
            ไม่เหมาะสมหรือขัดต่อกฎหมาย
          </p>
        </section>

        <section>
          <h2 className="font-semibold">การเปลี่ยนแปลงข้อกำหนด</h2>
          <p className="mt-1 text-shop-text-soft">
            ร้านขอสงวนสิทธิ์ในการปรับปรุงข้อกำหนดนี้ได้ตลอดเวลา โดยจะแจ้งวันที่ปรับปรุงล่าสุดไว้ด้านบนของหน้านี้
          </p>
        </section>

        <section>
          <h2 className="font-semibold">ติดต่อเรา</h2>
          <p className="mt-1 text-shop-text-soft">
            หากมีคำถามเกี่ยวกับข้อกำหนดการใช้งาน ติดต่อผ่าน{" "}
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
