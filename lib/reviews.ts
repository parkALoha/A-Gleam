import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type Review = {
  id: string;
  customerHandle: string;
  imageUrl: string;
  caption: string | null;
  rating: number;
};

export async function getVisibleReviews(): Promise<Review[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, customer_handle, image_url, caption, rating")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load reviews: ${error.message}`);
  }

  return data.map((row) => ({
    id: row.id,
    customerHandle: row.customer_handle,
    imageUrl: row.image_url,
    caption: row.caption,
    rating: row.rating,
  }));
}
