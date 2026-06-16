import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service — MIR4 Boss Tracker" };

const S = {
  page: {
    margin: 0,
    padding: "2rem 1rem 4rem",
    minHeight: "100vh",
    background: "#0f1117",
    color: "#e5e7eb",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: "15px",
    lineHeight: "1.7",
  } as React.CSSProperties,
  wrap: {
    maxWidth: 800,
    margin: "0 auto",
  } as React.CSSProperties,
  back: {
    display: "inline-block",
    marginBottom: "1.5rem",
    color: "#6b7280",
    textDecoration: "none",
    fontSize: "13px",
  } as React.CSSProperties,
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#f9fafb",
    margin: "0 0 0.25rem",
  } as React.CSSProperties,
  accent: { color: "#dc2626" } as React.CSSProperties,
  meta: {
    fontSize: "13px",
    color: "#4b5563",
    marginBottom: "2.5rem",
  } as React.CSSProperties,
  divider: {
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    margin: "2rem 0",
  } as React.CSSProperties,
  h2: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#f3f4f6",
    margin: "2rem 0 0.5rem",
  } as React.CSSProperties,
  p: {
    margin: "0 0 0.75rem",
    color: "#9ca3af",
  } as React.CSSProperties,
  ul: {
    margin: "0 0 0.75rem",
    paddingLeft: "1.5rem",
    color: "#9ca3af",
  } as React.CSSProperties,
  footer: {
    marginTop: "3rem",
    fontSize: "12px",
    color: "#374151",
    textAlign: "center",
  } as React.CSSProperties,
};

export default function TermsPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <a href="/discord-only" style={S.back}>← Back</a>

        <h1 style={S.title}>
          Terms of Service <span style={S.accent}>·</span>
        </h1>
        <p style={S.meta}>MIR4 Boss Tracker · Owner: devilren (Discord) · Last updated: June 2026</p>

        <hr style={S.divider} />

        <h2 style={S.h2}>1. Acceptance of Terms</h2>
        <p style={S.p}>
          By using MIR4 Boss Tracker ("the App"), you agree to these Terms of Service. If you do not agree, do not use the App.
        </p>

        <h2 style={S.h2}>2. Description of Service</h2>
        <p style={S.p}>
          MIR4 Boss Tracker is a Discord Activity that provides real-time boss spawn tracking, timers, and crafting calculators for the game MIR4. The App runs exclusively inside Discord and is not available as a standalone web application.
        </p>

        <h2 style={S.h2}>3. Use of the App</h2>
        <ul style={S.ul}>
          <li>The App is provided for personal, non-commercial use within Discord servers.</li>
          <li>You may not reverse-engineer, copy, or redistribute the App or its source code.</li>
          <li>You may not attempt to circumvent the App's Discord-only access restrictions.</li>
        </ul>

        <h2 style={S.h2}>4. Data Collection</h2>
        <p style={S.p}>
          The App stores boss kill timestamps in a database to synchronize timers across guild members. No personal data beyond Discord user IDs is collected or stored. See our Privacy Policy for details.
        </p>

        <h2 style={S.h2}>5. Availability</h2>
        <p style={S.p}>
          The App is provided "as is" without guarantees of uptime or availability. We reserve the right to modify, suspend, or discontinue the App at any time.
        </p>

        <h2 style={S.h2}>6. Premium Features</h2>
        <p style={S.p}>
          Certain features may require a paid subscription in the future. Pricing and terms for premium features will be announced separately.
        </p>

        <h2 style={S.h2}>7. Intellectual Property</h2>
        <p style={S.p}>
          MIR4 Boss Tracker is an independent fan project and is not affiliated with, endorsed by, or connected to Wemade Co., Ltd. or the official MIR4 game.
        </p>

        <h2 style={S.h2}>8. Changes to Terms</h2>
        <p style={S.p}>
          We may update these Terms at any time. Continued use of the App after changes constitutes acceptance of the new Terms.
        </p>

        <h2 style={S.h2}>9. Contact</h2>
        <p style={S.p}>
          For questions or requests to add the App to your server, contact{" "}
          <strong style={{ color: "#f9fafb" }}>devilren</strong> (AKA TOTORO) on Discord.
        </p>

        <hr style={S.divider} />
        <p style={S.footer}>MIR4 Boss Tracker — not affiliated with Wemade Co., Ltd.</p>
      </div>
    </div>
  );
}
