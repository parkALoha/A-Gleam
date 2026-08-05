import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "fs";

// Data-only backup — the schema itself is already safe in
// supabase/migrations/*.sql (tracked in git), so this exists to cover the
// one thing that ISN'T: real rows (orders, products, customer info) that
// would be gone for good if something went wrong during an update.
//
// Does NOT back up files in Supabase Storage (product photos, payment
// slips) — only Postgres table rows.
//
// Usage: node --experimental-websocket --env-file=.env.local scripts/backup-data.mjs

const TABLES = [
  "shop_settings",
  "products",
  "product_variants",
  "orders",
  "order_items",
  "profiles",
  "reviews",
  "push_subscriptions",
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const dir = `backups/${timestamp}`;
mkdirSync(dir, { recursive: true });

let totalRows = 0;

for (const table of TABLES) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.error(`✗ ${table}: ${error.message}`);
    continue;
  }
  writeFileSync(`${dir}/${table}.json`, JSON.stringify(data, null, 2));
  totalRows += data.length;
  console.log(`✓ ${table}: ${data.length} แถว`);
}

console.log(`\nบันทึกไว้ที่ ${dir}/ (รวม ${totalRows} แถว)`);
console.log("แนะนำ: ย้ายโฟลเดอร์นี้ไปเก็บที่อื่นด้วย (เช่น Google Drive) เผื่อเครื่องนี้มีปัญหา");
