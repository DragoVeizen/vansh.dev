import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = "Vansh Thakur — Full Stack Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(1100px 700px at 0% 0%, rgba(245,158,11,0.18), transparent 60%), radial-gradient(900px 600px at 100% 100%, rgba(245,158,11,0.08), transparent 55%), #0a0a0b",
          color: "#e4e4e7",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#f59e0b",
              boxShadow: "0 0 24px #f59e0b",
            }}
          />
          <div
            style={{
              fontSize: 22,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: "#a1a1aa",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            vansh.dev
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              fontSize: 132,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: "#fafafa",
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 500,
              color: "#f59e0b",
              letterSpacing: "-0.01em",
            }}
          >
            {site.title}
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.45,
              color: "#a1a1aa",
              maxWidth: 920,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: "#71717a",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <div>{`${site.location} · ${site.timezone}`}</div>
          <div>{site.email}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
