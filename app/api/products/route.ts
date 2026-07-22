import { NextResponse } from "next/server";
import { getPublishedProducts, type ProductTagFilter } from "@/lib/products";

const VALID_TAGS: ProductTagFilter[] = ["new", "bestseller", "sale"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tagParam = searchParams.get("tag");
  const tag = VALID_TAGS.includes(tagParam as ProductTagFilter)
    ? (tagParam as ProductTagFilter)
    : undefined;
  const search = searchParams.get("search") || undefined;
  const limit = Number(searchParams.get("limit") ?? 8);
  const offset = Number(searchParams.get("offset") ?? 0);

  const { products, total } = await getPublishedProducts({
    tag,
    search,
    limit,
    offset,
  });

  return NextResponse.json({ products, total });
}
