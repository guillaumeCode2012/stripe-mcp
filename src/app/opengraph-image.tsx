import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "StripeFlow — The most complete MCP server for Stripe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: 80,
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #7c3aed, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "white",
              fontWeight: 900,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            StripeFlow
          </span>
        </div>

        {/* Main tagline */}
        <p
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            margin: "0 0 16px",
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          The most complete MCP server for Stripe
        </p>

        <p
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            textAlign: "center",
            margin: "0 0 48px",
            fontWeight: 500,
          }}
        >
          Manage customers, subscriptions, invoices, and analytics with natural language
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 48, color: "#a1a1aa" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 24 }}>
            <span style={{ color: "#7c3aed", fontWeight: 700 }}>79</span>
            <span>tools</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 24 }}>
            <span style={{ color: "#7c3aed", fontWeight: 700 }}>19</span>
            <span>categories</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 24 }}>
            <span style={{ color: "#7c3aed", fontWeight: 700 }}>1</span>
            <span>command</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #7c3aed, #10b981)",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
