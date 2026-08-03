import { ImageResponse } from "next/og";

export const alt = "A GLEAM | อะ - กลีม";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f2e0d6 0%, #e9d9ca 50%, #f0e6dc 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 9999,
              background: "#9c827b",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              color: "#f0e6dc",
              fontWeight: 700,
            }}
          >
            AG
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#3f3a37", letterSpacing: 4 }}>
            AGLEAMIN3011
          </div>
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#87716b" }}>
          Casual &amp; Cuteness Everyday
        </div>
      </div>
    ),
    { ...size },
  );
}
