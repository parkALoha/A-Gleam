import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const { error } = await supabase
  .from("shop_settings")
  .update({ hero_image_urls: ["/hero/1.jpg", "/hero/2.jpg"] })
  .eq("id", true);

if (error) {
  console.error("Update failed:", error.message);
  process.exit(1);
}

console.log("Hero slideshow images set.");
