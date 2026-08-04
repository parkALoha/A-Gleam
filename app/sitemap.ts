import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getPublishedProducts } from "@/lib/products";

const STATIC_PAGES = ["", "/privacy-policy", "/terms", "/track-order"];
const COLLECTION_TAGS = ["new", "bestseller", "sale", "all"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const { products } = await getPublishedProducts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));

  const collectionEntries: MetadataRoute.Sitemap = COLLECTION_TAGS.map((tag) => ({
    url: `${base}/collections/${tag}`,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/products/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...collectionEntries, ...productEntries];
}
