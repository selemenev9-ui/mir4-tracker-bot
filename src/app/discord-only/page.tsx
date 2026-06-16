export default function DiscordOnlyPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MIR4 Boss Tracker — Discord Only</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          background: "#0f1117",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "#e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            padding: "40px 32px",
            margin: "0 16px",
            background: "#161b27",
            border: "1px solid rgba(220,38,38,0.25)",
            borderRadius: 16,
            boxShadow: "0 0 40px rgba(220,38,38,0.08)",
            textAlign: "center",
          }}
        >
          {/* Title */}
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚔️</div>
          <h1
            style={{
              margin: "0 0 6px",
              fontSize: 22,
              fontWeight: 700,
              color: "#f9fafb",
              letterSpacing: "0.02em",
            }}
          >
            MIR4 Boss Tracker
          </h1>

          {/* Divider */}
          <div
            style={{
              width: 40,
              height: 2,
              background: "#dc2626",
              borderRadius: 2,
              margin: "16px auto",
            }}
          />

          {/* Main message */}
          <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: "#f87171" }}>
            This app works inside Discord only.
          </p>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b7280" }}>
            Это приложение работает только внутри Discord.
          </p>

          {/* Body */}
          <p style={{ margin: "0 0 4px", fontSize: 14, color: "#9ca3af", lineHeight: 1.6 }}>
            Want to add it to your server? This is a private bot — contact the developer to request access.
          </p>
          <p style={{ margin: "0 0 28px", fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>
            Хотите добавить его на свой сервер? Это приватный бот — свяжитесь с разработчиком для получения доступа.
          </p>

          {/* Contact */}
          <div
            style={{
              background: "rgba(220,38,38,0.07)",
              border: "1px solid rgba(220,38,38,0.18)",
              borderRadius: 10,
              padding: "14px 20px",
              marginBottom: 28,
              fontSize: 14,
              color: "#d1d5db",
            }}
          >
            📩 Discord:{" "}
            <strong style={{ color: "#f9fafb" }}>devilren</strong>
            {" "}(AKA{" "}
            <strong style={{ color: "#f9fafb" }}>TOTORO</strong>
            )
          </div>

          {/* Footer */}
          <p style={{ margin: 0, fontSize: 11, color: "#374151" }}>
            © MIR4 Boss Tracker — not affiliated with Wemade Co., Ltd.
          </p>
        </div>
      </body>
    </html>
  );
}
