import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const orderNumber = process.argv[2];

const { data: order, error } = await supabase
  .from("orders")
  .select("*, order_items(*)")
  .eq("order_number", orderNumber)
  .single();

if (error) {
  console.error("Query failed:", error.message);
  process.exit(1);
}

console.log(JSON.stringify(order, null, 2));

const { data: signedUrl } = await supabase.storage
  .from("payment-slips")
  .createSignedUrl(order.slip_image_path, 60);
console.log("Slip signed URL (60s):", signedUrl?.signedUrl);
