import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const { error } = await supabase
  .from("shop_settings")
  .update({ hero_image_url: "/hero-mock.svg" })
  .eq("id", true);

if (error) {
  console.error("Update failed:", error.message);
  process.exit(1);
}

console.log("Hero mock image set.");
