import { items, orders, formatINR, calcReorder, calcRiskScore } from "../data/staticData";

export default function KPICards() {
  const totalPlanned = items.reduce((s, i) => s + i.planned.qty * i.planned.rate, 0);
  const totalActual  = items.reduce((s, i) => s + i.actual.qty * i.actual.rate, 0);
  const totalVariance = totalActual - totalPlanned;
  const reorderCount = items.filter((i) => calcReorder(i).reorderQty > 0).length;
  const avgRisk = Math.round(items.reduce((s, i) => s + calcRiskScore(i), 0) / items.length);

  const cards = [
    {
      label: "Total Planned Cost",
      value: formatINR(totalPlanned),
      sub: "Bill of Materials baseline",
      accent: "#c9a84c",
      icon: "◎",
    },
    {
      label: "Total Actual Cost",
      value: formatINR(totalActual),
      sub: "Real consumption cost",
      accent: "#c9a84c",
      icon: "◉",
    },
    {
      label: "Net Variance",
      value: `${totalVariance > 0 ? "+" : ""}${formatINR(totalVariance)}`,
      sub: totalVariance > 0 ? "⚠ Production Overspend" : "✓ Cost Saving Achieved",
      accent: totalVariance > 0 ? "#f87171" : "#4ade80",
      bg: totalVariance > 0 ? "rgba(139,26,26,0.2)" : "rgba(26,58,42,0.2)",
      icon: totalVariance > 0 ? "▲" : "▼",
    },
    {
      label: "Items At Risk",
      value: reorderCount,
      sub: `${reorderCount} items need reorder`,
      accent: reorderCount > 0 ? "#f87171" : "#4ade80",
      pulse: reorderCount > 0,
      icon: "⚑",
    },
    {
      label: "Avg Risk Score",
      value: `${avgRisk}/100`,
      sub: avgRisk > 60 ? "High operational risk" : avgRisk > 35 ? "Moderate risk level" : "Low risk level",
      accent: avgRisk > 60 ? "#f87171" : avgRisk > 35 ? "#c9a84c" : "#4ade80",
      icon: "◈",
    },
    {
      label: "Active Orders",
      value: orders.length,
      sub: `${orders.filter(o => o.actual > o.planned).length} over budget`,
      accent: "#c9a84c",
      icon: "◆",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14, marginBottom: 24 }}>
      {cards.map((c, i) => (
        <div key={i} className="card" style={{
          backgroundColor: c.bg || "#0d1526",
          borderTop: `3px solid ${c.accent}`,
          animationDelay: `${i * 0.07}s`,
          opacity: 0,
          animationFillMode: "forwards",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "'Raleway',sans-serif", fontWeight: 700 }}>
              {c.label}
            </p>
            <span style={{ color: c.accent, fontSize: 14, opacity: 0.6 }}>{c.icon}</span>
          </div>
          <p className={c.pulse ? "gold-pulse" : ""} style={{
            fontSize: 28,
            fontWeight: 800,
            fontFamily: "'Share Tech Mono', monospace",
            color: c.accent,
            marginBottom: 6,
            lineHeight: 1,
            textShadow: `0 0 16px ${c.accent}40`,
          }}>
            {c.value}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", fontFamily: "'Raleway',sans-serif" }}>{c.sub}</p>
        </div>
      ))}
    </div>
  );
}