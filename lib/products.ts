import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type Measurements = {
  bust: number;
  length: number;
  shoulder: number;
};

export type ProductTag = "ใหม่" | "ขายดี" | "ลดราคา";

export type ProductVariant = {
  id: string;
  colorName: string;
  images: string[];
  quantityAvailable: number;
  inStock: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  videoUrl?: string;
  description: string;
  measurements: Measurements;
  tag?: ProductTag;
  variants: ProductVariant[];
  /** "All colors at a glance" shot, e.g. for products with several variants */
  coverImage?: string;
  /** Convenience accessors derived from variants (first/in-stock variant) */
  images: string[];
  inStock: boolean;
  quantityAvailable: number;
};

type VariantRow = {
  id: string;
  color_name: string;
  images: string[];
  stock_quantity: number;
  sort_order: number;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  cover_image: string | null;
  video_url: string | null;
  description: string | null;
  measurements: Partial<Measurements> | null;
  tag: string | null;
  product_variants: VariantRow[];
};

function toProduct(row: ProductRow): Product {
  const variants: ProductVariant[] = [...row.product_variants]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({
      id: v.id,
      colorName: v.color_name,
      images: v.images,
      quantityAvailable: v.stock_quantity,
      inStock: v.stock_quantity > 0,
    }));

  const coverVariant = variants.find((v) => v.inStock) ?? variants[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    compareAtPrice:
      row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    coverImage: row.cover_image ?? undefined,
    videoUrl: row.video_url ?? undefined,
    description: row.description ?? "",
    measurements: {
      bust: row.measurements?.bust ?? 0,
      length: row.measurements?.length ?? 0,
      shoulder: row.measurements?.shoulder ?? 0,
    },
    tag: (row.tag as ProductTag) ?? undefined,
    variants,
    images: coverVariant?.images ?? [],
    inStock: variants.some((v) => v.inStock),
    quantityAvailable: variants.reduce((sum, v) => sum + v.quantityAvailable, 0),
  };
}

const PRODUCT_SELECT =
  "id, slug, name, price, compare_at_price, cover_image, video_url, description, measurements, tag, product_variants(id, color_name, images, stock_quantity, sort_order)";

export async function getPublishedProducts(): Promise<Product[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  return (data as unknown as ProductRow[]).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load product: ${error.message}`);
  }

  return data ? toProduct(data as unknown as ProductRow) : null;
}
