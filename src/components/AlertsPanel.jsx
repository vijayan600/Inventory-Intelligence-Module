import { items, calcReorder, calcRiskScore } from "../data/staticData";

export default function AlertsPanel() {
  const critical = items.filter((i) => calcReorder(i).reorderQty > 0)
    .sort((a, b) => calcRiskScore(b) - calcRiskScore(a));

  return (
    <div className="card">
      <p className="section-title">⚑ Critical Reorder Alerts</p>
      {critical.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>All inventory levels are stable</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {critical.map((item) => {
            const { reorderQty, reorderLevel, coverageDays } = calcReorder(item);
            const risk = calcRiskScore(item);
            return (
              <div key={item.id} style={{
                borderLeft: "3px solid #8b1a1a",
                background: "rgba(139,26,26,0.08)",
                borderRadius: "0 6px 6px 0",
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <p style={{ color: "#c9a84c", fontWeight: 700, fontSize: 13, fontFamily: "'Cinzel',serif" }}>{item.name}</p>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>RISK {risk}/100</span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 10, fontFamily: "monospace" }}>
                    Stock: {item.inventory.current} {item.unit} · Reorder Level: {reorderLevel} · {coverageDays}d remaining
                  </p>
                </div>
                <span className="badge badge-critical" style={{ whiteSpace: "nowrap" }}>
                  ORDER +{reorderQty}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}