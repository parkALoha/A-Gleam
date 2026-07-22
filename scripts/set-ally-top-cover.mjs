import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const { error } = await supabase
  .from("products")
  .update({ cover_image: "/products/ally-top/collage.jpg" })
  .eq("slug", "ally-top");

if (error) {
  console.error("Update failed:", error.message);
  process.exit(1);
}

console.log("Ally Top cover image set.");
