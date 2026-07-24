// Explicit allowlist rather than a broad "image/*" prefix check — SVG in
// particular can embed <script> and is excluded on purpose.
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isAllowedImageType(type: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}
