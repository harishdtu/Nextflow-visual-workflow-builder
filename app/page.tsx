import Link from "next/link";

export default function Home() {
  const models = [
    "Gemini 2.5 Flash", "Gemini 2.5 Pro", "Gemini 2.0 Flash",
    "Gemini 2.0 Flash Lite", "Gemini 3 Flash", "Gemini 3.1 Flash Lite",
    "Gemini 2.5 Flash", "Gemini 2.5 Pro", "Gemini 2.0 Flash",
    "Gemini 2.0 Flash Lite", "Gemini 3 Flash", "Gemini 3.1 Flash Lite",
  ];

  const features = [
    {
      icon: "📝",
      title: "Text nodes",
      desc: "Write prompts, system instructions, or any text content to feed into your workflow.",
    },
    {
      icon: "🖼️",
      title: "Image nodes",
      desc: "Upload and pass images through your pipeline — crop, transform, and analyze visually.",
    },
    {
      icon: "🎥",
      title: "Video nodes",
      desc: "Extract frames, pass video data between nodes, and build video-aware AI pipelines.",
    },
    {
      icon: "🤖",
      title: "AI nodes",
      desc: "Connect to Gemini models. Pass text, images, and frames — get intelligent responses.",
    },
    {
      icon: "✂️",
      title: "Crop nodes",
      desc: "Precisely crop regions of images and pass them downstream for focused analysis.",
    },
    {
      icon: "🎬",
      title: "Frame nodes",
      desc: "Extract specific frames from video at any timestamp. Feed directly into AI nodes.",
    },
  ];

  return (
    <main
      style={{
        background: "#080808",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ── Google Font ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }

        .fade-in-1 { animation: fadeIn 0.7s ease 0.1s both; }
        .fade-in-2 { animation: fadeIn 0.7s ease 0.25s both; }
        .fade-in-3 { animation: fadeIn 0.7s ease 0.4s both; }
        .fade-in-4 { animation: fadeIn 0.7s ease 0.55s both; }

        .cta-primary {
          background: #fff;
          color: #080808;
          border: none;
          padding: 14px 32px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.15s;
          font-family: inherit;
        }
        .cta-primary:hover { opacity: 0.88; }

        .cta-secondary {
          background: transparent;
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 14px 32px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 400;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.15s, color 0.15s;
          font-family: inherit;
        }
        .cta-secondary:hover {
          border-color: rgba(255,255,255,0.35);
          color: #fff;
        }

        .feature-card {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 16px;
          padding: 28px;
          transition: border-color 0.2s, background 0.2s;
        }
        .feature-card:hover {
          border-color: #333;
          background: #141414;
        }

        .model-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border: 1px solid #222;
          border-radius: 999px;
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          white-space: nowrap;
          margin: 0 6px;
          background: #0f0f0f;
        }

        .stat-card {
          border-top: 1px solid #1e1e1e;
          padding-top: 28px;
        }

        .nav-link {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.15s;
        }
        .nav-link:hover { color: #fff; }
      `}</style>

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          background: "rgba(8,8,8,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          {/* Krea-style geometric logo mark */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="10" height="10" rx="2" fill="white" opacity="1"/>
            <rect x="12" y="0" width="10" height="10" rx="2" fill="white" opacity="0.5"/>
            <rect x="0" y="12" width="10" height="10" rx="2" fill="white" opacity="0.5"/>
            <rect x="12" y="12" width="10" height="10" rx="2" fill="white" opacity="0.25"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em", color: "#fff" }}>
            NextFlow
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#models" className="nav-link">Models</a>
          <Link href="/dashboard" className="cta-primary" style={{ padding: "10px 22px", fontSize: 14 }}>
            Launch app
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          position: "relative",
        }}
      >
        {/* subtle radial glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 500,
            background:
              "radial-gradient(ellipse, rgba(138,92,246,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* live badge */}
        <div className="fade-in-1"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999, padding: "7px 16px",
            fontSize: 13, color: "rgba(255,255,255,0.6)",
            marginBottom: 36, background: "rgba(255,255,255,0.04)",
          }}
        >
          <span
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#4ade80",
              animation: "pulse-dot 2s ease-in-out infinite",
              display: "inline-block",
            }}
          />
          Now live — build AI workflows visually
        </div>

        {/* headline */}
        <h1 className="fade-in-2"
          style={{
            fontSize: "clamp(42px, 7vw, 86px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            maxWidth: 820,
            marginBottom: 28,
          }}
        >
          The visual AI
          <br />
          <span style={{ color: "rgba(255,255,255,0.35)" }}>workflow builder.</span>
        </h1>

        {/* sub */}
        <p className="fade-in-3"
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.45)",
            maxWidth: 500,
            lineHeight: 1.7,
            marginBottom: 44,
          }}
        >
          Connect text, images, video, and AI models in one canvas.
          No code. Just flow.
        </p>

        {/* CTAs */}
        <div className="fade-in-4"
          style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}
        >
          <Link href="/dashboard" className="cta-primary">
            Start for free →
          </Link>
          <Link href="/dashboard" className="cta-secondary">
            Launch app
          </Link>
        </div>

        {/* node flow pills */}
        <div className="fade-in-4"
          style={{
            display: "flex", alignItems: "center", gap: 0,
            marginTop: 72,
            opacity: 0.6,
          }}
        >
          {["📝 Text", "🖼️ Image", "🎥 Video", "🤖 AI", "✨ Output"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  padding: "8px 18px",
                  border: "1px solid #222",
                  borderRadius: 999,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                  background: "#111",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>
              {i < 4 && (
                <div
                  style={{
                    width: 28, height: 1,
                    background: "rgba(255,255,255,0.12)",
                    position: "relative",
                  }}
                >
                  <div style={{
                    position: "absolute", right: -4, top: -3,
                    width: 0, height: 0,
                    borderLeft: "5px solid rgba(255,255,255,0.2)",
                    borderTop: "3px solid transparent",
                    borderBottom: "3px solid transparent",
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE — Models ── */}
      <section id="models" style={{ padding: "60px 0", borderTop: "1px solid #111", borderBottom: "1px solid #111", overflow: "hidden" }}>
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track">
            {[...models, ...models].map((m, i) => (
              <div key={i} className="model-pill">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                {m}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40 }}>
          {[
            { num: "6", label: "Node types" },
            { num: "6+", label: "AI models" },
            { num: "∞", label: "Workflows" },
            { num: "0", label: "Code required" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8 }}>
                {s.num}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "0 40px 120px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16 }}>
            Everything you need
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1, maxWidth: 560 }}>
            Six node types.{" "}
            <span style={{ color: "rgba(255,255,255,0.3)" }}>Infinite possibilities.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        style={{
          borderTop: "1px solid #111",
          padding: "120px 40px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(32px, 5vw, 64px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          Start building your
          <br />
          <span style={{ color: "rgba(255,255,255,0.3)" }}>first workflow today.</span>
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", marginBottom: 40 }}>
          Free to use. No credit card required.
        </p>
        <Link href="/dashboard" className="cta-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
          Go to dashboard →
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid #111",
          padding: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="10" height="10" rx="2" fill="white" opacity="1"/>
            <rect x="12" y="0" width="10" height="10" rx="2" fill="white" opacity="0.5"/>
            <rect x="0" y="12" width="10" height="10" rx="2" fill="white" opacity="0.5"/>
            <rect x="12" y="12" width="10" height="10" rx="2" fill="white" opacity="0.25"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>NextFlow</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
          © 2026 NextFlow. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#" className="nav-link" style={{ fontSize: 13 }}>Privacy</a>
          <a href="#" className="nav-link" style={{ fontSize: 13 }}>Terms</a>
        </div>
      </footer>
    </main>
  );
}