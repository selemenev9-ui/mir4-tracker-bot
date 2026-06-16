import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — MIR4 Boss Tracker" };

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
  strong: { color: "#f9fafb" } as React.CSSProperties,
  footer: {
    marginTop: "3rem",
    fontSize: "12px",
    color: "#374151",
    textAlign: "center",
  } as React.CSSProperties,
};

const link: React.CSSProperties = {
  color: "#6b7280",
  textDecoration: "underline",
};

export default function PrivacyPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <a href="/discord-only" style={S.back}>← Back</a>

        <h1 style={S.title}>
          Privacy Policy <span style={S.accent}>·</span>
        </h1>
        <p style={S.meta}>MIR4 Boss Tracker · Owner: devilren (Discord) · Last updated: June 2026</p>

        <hr style={S.divider} />

        <h2 style={S.h2}>1. Introduction</h2>
        <p style={S.p}>
          This Privacy Policy describes how MIR4 Boss Tracker ("the App") handles information when you use it inside Discord.
        </p>

        <h2 style={S.h2}>2. Information We Collect</h2>
        <ul style={S.ul}>
          <li>
            <strong style={S.strong}>Discord User ID</strong>: collected when you interact with boss timers (e.g. clicking "Killed"). Used only to display who reported a kill.
          </li>
          <li>
            <strong style={S.strong}>Boss kill timestamps</strong>: stored to synchronize spawn timers across guild members.
          </li>
          <li>
            We do <strong style={S.strong}>NOT</strong> collect: names, emails, profile pictures, messages, or any other personal data.
          </li>
        </ul>

        <h2 style={S.h2}>3. How We Use Information</h2>
        <ul style={S.ul}>
          <li>To display boss respawn timers to members of the same Discord server.</li>
          <li>To attribute kill reports to the reporting user (by Discord user ID only).</li>
        </ul>

        <h2 style={S.h2}>4. Data Storage</h2>
        <p style={S.p}>
          Data is stored in a secure Supabase (PostgreSQL) database hosted in the EU/US. Boss timer data is automatically overwritten when a new kill is reported.
        </p>

        <h2 style={S.h2}>5. Data Sharing</h2>
        <p style={S.p}>
          We do not sell, share, or transfer any data to third parties. Timer data is visible only to members of the same Discord server where the App is installed.
        </p>

        <h2 style={S.h2}>6. Data Retention</h2>
        <p style={S.p}>
          Timer data is retained until overwritten by a new kill report. We do not maintain historical logs.
        </p>

        <h2 style={S.h2}>7. Your Rights</h2>
        <p style={S.p}>
          You may request deletion of any data associated with your Discord user ID by contacting the developer.
        </p>

        <h2 style={S.h2}>8. Third-Party Services</h2>
        <ul style={S.ul}>
          <li>
            <strong style={S.strong}>Discord</strong>: the App operates within Discord's platform and is subject to Discord's{" "}
            <a href="https://discord.com/privacy" style={link} target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </li>
          <li>
            <strong style={S.strong}>Vercel</strong>: the App is hosted on Vercel. See{" "}
            <a href="https://vercel.com/legal/privacy-policy" style={link} target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a>.
          </li>
          <li>
            <strong style={S.strong}>Supabase</strong>: database hosting. See{" "}
            <a href="https://supabase.com/privacy" style={link} target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>.
          </li>
        </ul>

        <h2 style={S.h2}>9. Changes to This Policy</h2>
        <p style={S.p}>
          We may update this Privacy Policy. Changes will be posted at this URL.
        </p>

        <h2 style={S.h2}>10. Contact</h2>
        <p style={S.p}>
          Questions about privacy: contact{" "}
          <strong style={S.strong}>devilren</strong> (AKA TOTORO) on Discord.
        </p>

        <hr style={S.divider} />
        <p style={S.footer}>MIR4 Boss Tracker — not affiliated with Wemade Co., Ltd.</p>
      </div>
    </div>
  );
}
