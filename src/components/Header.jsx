import { useState, useEffect } from "react";

export default function Header() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: "linear-gradient(135deg, #080d1c 0%, #0d1526 50%, #080d1c 100%)",
      borderBottom: "1px solid rgba(201,168,76,0.3)",
      padding: "18px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 4px 40px rgba(0,0,0,0.6)",
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ position: "relative" }}>
          <span style={{ color: "#c9a84c", fontSize: 40, lineHeight: 1, filter: "drop-shadow(0 0 12px rgba(201,168,76,0.6))" }}>♛</span>
        </div>
        <div>
          <div style={{
            fontFamily: "'Cinzel', serif",
            color: "#c9a84c",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textShadow: "0 0 20px rgba(201,168,76,0.4)",
          }}>
            Inventory Command Center
          </div>
          <div style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginTop: 3,
            fontFamily: "'Raleway', sans-serif",
          }}>
            Production Intelligence Dashboard · Textile Manufacturing Unit
          </div>
        </div>
      </div>

      {/* Center decorative */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {["LIVE", "SYSTEM ACTIVE"].map((txt, i) => (
          <span key={i} style={{
            fontSize: 9,
            fontFamily: "'Share Tech Mono', monospace",
            color: i === 0 ? "#4ade80" : "rgba(255,255,255,0.25)",
            border: `1px solid ${i === 0 ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`,
            padding: "2px 7px",
            borderRadius: 3,
            letterSpacing: "0.12em",
          }}>
            {i === 0 && <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", backgroundColor: "#4ade80", marginRight: 5, animation: "goldPulse 1.5s ease-in-out infinite" }} />}
            {txt}
          </span>
        ))}
      </div>

      {/* Right - Clock */}
      <div style={{ textAlign: "right" }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          color: "#c9a84c",
          fontSize: 28,
          fontWeight: 700,
          textShadow: "0 0 16px rgba(201,168,76,0.5)",
          letterSpacing: "0.08em",
        }}>
          {time.toLocaleTimeString("en-IN", { hour12: false })}
        </div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 2, letterSpacing: "0.1em", fontFamily: "'Raleway', sans-serif" }}>
          {time.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}