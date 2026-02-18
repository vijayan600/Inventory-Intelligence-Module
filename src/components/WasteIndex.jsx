import { useState, useEffect } from "react";
import { formatINR } from "../data/staticData";
import { fetchVarianceReport } from "../api";

export default function WasteIndex() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchVarianceReport().then(setRows);
  }, []);

  if (rows.length === 0) return null;

  const sorted = [...rows].sort((a, b) => b.waste_pct - a.waste_pct);

  return (
    <div className="card">
      <p className="section-title">⚗ Waste & Efficiency Index</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Raleway',sans-serif" }}>
        Leaderboard showing which items are consuming more than planned. High waste % = production floor investigation needed.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sorted.map((r, rank) => {
          const wastePct = r.waste_pct;
          const efficiencyPct = r.efficiency_pct;
          const variance = r.variance;
          const isWaste = wastePct > 0;
          const wasteColor = wastePct > 8 ? "#f87171" : wastePct > 3 ? "#c9a84c" : "#4ade80";

          return (
            <div key={r.id} style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${isWaste && wastePct > 5 ? "rgba(139,26,26,0.3)" : "rgba(201,168,76,0.08)"}`,
              borderRadius: 6,
              transition: "all 0.3s",
            }}>
              {/* Rank */}
              <div style={{
                width: 32, height: 32,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: rank === 0 ? "rgba(139,26,26,0.3)" : rank === 1 ? "rgba(201,168,76,0.1)" : "rgba(26,58,42,0.2)",
                border: `1px solid ${rank === 0 ? "#8b1a1a" : rank === 1 ? "rgba(201,168,76,0.3)" : "rgba(26,58,42,0.3)"}`,
                fontSize: 11, fontFamily: "monospace", fontWeight: 700,
                color: rank === 0 ? "#f87171" : rank === 1 ? "#c9a84c" : "#4ade80",
                flexShrink: 0,
              }}>
                #{rank + 1}
              </div>

              {/* Name */}
              <div style={{ width: 70 }}>
                <p style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12 }}>{r.name}</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace" }}>{r.unit}</p>
              </div>

              {/* Bar */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    Efficiency: <span style={{ color: wasteColor }}>{efficiencyPct.toFixed(1)}%</span>
                  </span>
                  <span style={{ fontSize: 10, color: wasteColor, fontFamily: "monospace" }}>
                    {isWaste ? `▲ ${wastePct.toFixed(1)}% waste` : `✓ ${Math.abs(wastePct).toFixed(1)}% saved`}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{
                    width: `${Math.min(efficiencyPct, 100)}%`,
                    backgroundColor: wasteColor,
                    boxShadow: `0 0 6px ${wasteColor}60`,
                  }} />
                </div>
              </div>

              {/* Impact */}
              <div style={{ textAlign: "right", minWidth: 90 }}>
                <p style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: variance > 0 ? "#f87171" : "#4ade80" }}>
                  {variance > 0 ? "+" : ""}{formatINR(variance)}
                </p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>variance</p>
              </div>

              {/* Badge */}
              <div style={{ minWidth: 80 }}>
                <span className={`badge ${wastePct > 5 ? "badge-loss" : wastePct > 0 ? "badge-gold" : "badge-saving"}`}>
                  {wastePct > 8 ? "HIGH WASTE" : wastePct > 3 ? "MODERATE" : wastePct > 0 ? "LOW WASTE" : "EFFICIENT"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="divider" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[
          ["Avg Efficiency", `${(rows.reduce((s,r) => s + r.efficiency_pct, 0) / rows.length).toFixed(1)}%`, "#c9a84c"],
          ["Total Waste Cost", formatINR(rows.reduce((s,r) => s + (r.variance > 0 ? r.variance : 0), 0)), "#f87171"],
          ["Items Efficient", `${rows.filter(r => r.efficiency_pct >= 100).length}/${rows.length}`, "#4ade80"],
        ].map(([label, val, color]) => (
          <div key={label} style={{ textAlign: "center", padding: "10px 0" }}>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 800, color }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}