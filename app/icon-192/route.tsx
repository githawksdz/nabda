import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1b1b1e",
          color: "#fcf8fb",
          fontSize: 72,
          fontWeight: 700,
        }}
      >
        N
      </div>
    ),
    { width: 192, height: 192 },
  );
}
