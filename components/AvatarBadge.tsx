import Image from "next/image";

// Same idea as Gmail's default avatar: no photo yet → a colored circle with
// the first letter of the name/email. Color is derived from the label so
// the same person always gets the same color, not a random one each render.
const COLORS = [
  "#F6BEAD", // shop-coral
  "#E9D9CA", // shop-blush
  "#D0AEA5", // dusty rose
  "#DBCCC5", // khaki
  "#E2CDBA", // nude
];

function colorFor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function AvatarBadge({
  avatarUrl,
  label,
  size = 32,
}: {
  avatarUrl?: string | null;
  label: string;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <span
        className="relative inline-block shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        <Image src={avatarUrl} alt="" fill unoptimized className="object-cover" />
      </span>
    );
  }

  const initial = label.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-shop-text"
      style={{
        width: size,
        height: size,
        backgroundColor: colorFor(label),
        fontSize: size * 0.45,
      }}
    >
      {initial}
    </span>
  );
}
