import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const mockSlugs = [
  "peterpan-blouse-01",
  "linen-shirt-01",
  "knit-top-01",
  "ribbon-blouse-02",
];

const { error, data } = await supabase
  .from("products")
  .delete()
  .in("slug", mockSlugs)
  .select("slug");

if (error) {
  console.error("Delete failed:", error.message);
  process.exit(1);
}

console.log(`Deleted ${data.length} mock products:`, data.map((d) => d.slug));
