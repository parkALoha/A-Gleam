import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type Measurements = {
  bust: number;
  length: number;
  shoulder: number;
};

export type ProductTag = "ใหม่" | "ขายดี" | "ลดราคา" | "ตำหนิ";

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

/** URL-friendly filter slugs mapped to the Thai values actually stored in the DB. */
export type ProductTagFilter = "new" | "bestseller" | "sale";

const TAG_FILTER_TO_DB: Record<ProductTagFilter, ProductTag> = {
  new: "ใหม่",
  bestseller: "ขายดี",
  sale: "ลดราคา",
};

// New → Best Seller → everything else, so on opening day (a handful of New,
// a few more Best Seller) customers see the highlighted items first without
// having to scroll through a long, arbitrarily-ordered "all products" list.
const TAG_PRIORITY: Record<string, number> = {
  ใหม่: 0,
  ขายดี: 1,
  ลดราคา: 2,
};

export async function getPublishedProducts(options?: {
  tag?: ProductTagFilter;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ products: Product[]; total: number }> {
  const supabase = createPublicSupabaseClient();

  if (options?.search) {
    // Name-only search, paginated directly in the DB (same tiebreaker as the
    // tag views, for the same reason: stable order across .range() calls).
    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .eq("is_published", true)
      .ilike("name", `%${options.search}%`)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true });

    if (options.limit !== undefined) {
      const from = options.offset ?? 0;
      query = query.range(from, from + options.limit - 1);
    }

    const { data, error, count } = await query;
    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return {
      products: (data as unknown as ProductRow[]).map(toProduct),
      total: count ?? 0,
    };
  }

  if (options?.tag) {
    // Single-tag views can be paginated directly in the DB. `id` is a
    // required tiebreaker: rows sharing the same `created_at` (e.g. a batch
    // seed) otherwise have no stable order across separate .range() calls,
    // which caused the same product to reappear on two pages while scrolling.
    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .eq("is_published", true)
      .eq("tag", TAG_FILTER_TO_DB[options.tag])
      .order("created_at", { ascending: false })
      .order("id", { ascending: true });

    if (options.limit !== undefined) {
      const from = options.offset ?? 0;
      query = query.range(from, from + options.limit - 1);
    }

    const { data, error, count } = await query;
    if (error) {
      throw new Error(`Failed to load products: ${error.message}`);
    }

    return {
      products: (data as unknown as ProductRow[]).map(toProduct),
      total: count ?? 0,
    };
  }

  // "All products": the shop's whole catalog is small, so fetch it once and
  // sort/paginate in memory — lets us order by tag priority, which plain SQL
  // ORDER BY can't express without a migration.
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  const all = (data as unknown as ProductRow[]).map(toProduct);
  const sorted = [...all].sort(
    (a, b) =>
      (TAG_PRIORITY[a.tag ?? ""] ?? 3) - (TAG_PRIORITY[b.tag ?? ""] ?? 3),
  );

  const from = options?.offset ?? 0;
  const products =
    options?.limit !== undefined
      ? sorted.slice(from, from + options.limit)
      : sorted;

  return { products, total: sorted.length };
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
