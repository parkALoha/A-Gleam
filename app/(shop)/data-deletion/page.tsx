export const metadata = {
  title: "การลบข้อมูลผู้ใช้ | A GLEAM",
};

export default function DataDeletionPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-semibold text-shop-text">
        การลบข้อมูลผู้ใช้
      </h1>
      <p className="mt-1 text-sm text-shop-text-soft">A GLEAM | อะ - กลีม</p>

      <div className="mt-6 space-y-4 rounded-2xl bg-white p-6 text-sm leading-relaxed text-shop-text shadow-sm ring-1 ring-shop-blush-100">
        <p>
          หากคุณต้องการให้เราลบบัญชีสมาชิกและข้อมูลส่วนตัวที่เก็บไว้ (ชื่อ เบอร์โทร ที่อยู่ อีเมล
          รูปโปรไฟล์) ออกจากระบบของเรา ไม่ว่าจะสมัครด้วยอีเมล/รหัสผ่าน หรือผ่าน Google/Facebook
          สามารถแจ้งขอลบได้ตามช่องทางด้านล่าง
        </p>

        <div>
          <h2 className="font-semibold">วิธีขอลบข้อมูล</h2>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-shop-text-soft">
            <li>
              ทักแจ้งขอลบข้อมูลผ่าน{" "}
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
            </li>
            <li>แจ้งอีเมลหรือเบอร์โทรที่ใช้สมัครสมาชิก เพื่อให้ทีมงานยืนยันตัวตนก่อนลบ</li>
            <li>ทีมงานจะลบบัญชีและข้อมูลส่วนตัวให้ภายใน 7 วันทำการ</li>
          </ol>
        </div>

        <div>
          <h2 className="font-semibold">ข้อมูลที่ยังเก็บไว้หลังลบบัญชี</h2>
          <p className="mt-1 text-shop-text-soft">
            ประวัติคำสั่งซื้อที่เกิดขึ้นแล้วจะยังถูกเก็บไว้ตามกฎหมายบัญชี/ภาษี แต่จะไม่ผูกกับบัญชีสมาชิก
            ของคุณอีกต่อไป
          </p>
        </div>
      </div>
    </div>
  );
}
