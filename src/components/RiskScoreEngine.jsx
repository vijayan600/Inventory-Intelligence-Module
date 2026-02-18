import { items, calcRiskScore, calcReorder, formatINR, calcProductionLoss } from "../data/staticData";

function RiskDial({ score }) {
  const radius = 36;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#f87171" : score >= 40 ? "#c9a84c" : "#4ade80";
  const label = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={90} height={52} viewBox="0 0 90 52">
        {/* Track */}
        <path
          d="M 8 48 A 37 37 0 0 1 82 48"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={7}
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d="M 8 48 A 37 37 0 0 1 82 48"
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 6px ${color}80)`,
            transition: "stroke-dashoffset 1s ease",
          }}
        />
        {/* Score text */}
        <text x="45" y="38" textAnchor="middle" fill={color}
          fontSize="13" fontFamily="'Share Tech Mono', monospace" fontWeight="700">
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 9, color, fontFamily: "monospace", letterSpacing: "0.12em", marginTop: -4 }}>{label} RISK</span>
    </div>
  );
}

export default function RiskScoreEngine() {
  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <p className="section-title">◈ AI Risk Score Engine</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Raleway',sans-serif" }}>
          Risk score calculated from: stock depletion rate, supplier lead time exposure, cost variance trend, and historical delay frequency.
        </p>

        <div className="grid-5">
          {items.map((item) => {
            const score = calcRiskScore(item);
            const { reorderQty, coverageDays } = calcReorder(item);
            const isCritical = reorderQty > 0;
            const riskColor = score >= 70 ? "#f87171" : score >= 40 ? "#c9a84c" : "#4ade80";

            return (
              <div key={item.id} className={`card ${isCritical ? "card-critical" : ""}`} style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <p style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em" }}>
                    {item.name}
                  </p>
                  <span className={`badge ${isCritical ? "badge-critical" : "badge-stable"}`}>
                    {isCritical ? "CRITICAL" : "STABLE"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
                  <RiskDial score={score} />
                </div>

                {[
                  ["Stock Cover", `${coverageDays} days`],
                  ["Lead Time", `${item.inventory.lead} days`],
                  ["Delay History", `${item.delayHistory} incidents`],
                  ["Supplier", item.supplier],
                ].map(([label, val]) => (
                  <div key={label} className="data-row">
                    <span className="data-label">{label}</span>
                    <span className="data-value" style={{ fontSize: 11 }}>{val}</span>
                  </div>
                ))}

                {/* Risk breakdown bars */}
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginBottom: 6 }}>RISK COMPOSITION</p>
                  <div className="progress-track" style={{ marginBottom: 4 }}>
                    <div className="progress-fill" style={{
                      width: `${score}%`,
                      background: `linear-gradient(90deg, #4ade80, #c9a84c ${score > 50 ? "50%" : "100%"}, #f87171)`,
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Loss Calculator */}
      <div className="card">
        <p className="section-title">💀 Production Loss Calculator</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Raleway',sans-serif" }}>
          If a critical item runs out — here is exactly how much money the factory loses per hour and per day.
        </p>

        <div className="grid-3">
          {items.filter(i => calcReorder(i).reorderQty > 0).map((item) => {
            const loss = calcProductionLoss(item);
            return (
              <div key={item.id} className="card" style={{
                borderTop: "3px solid #8b1a1a",
                background: "rgba(139,26,26,0.07)",
                padding: 18,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <p style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14 }}>{item.name}</p>
                  <span className="badge badge-critical">STOCKOUT IN {loss.coverageDays}d</span>
                </div>

                {[
                  ["Hours Until Stockout", `${loss.hoursUntilStop.toFixed(1)} hrs`],
                  ["Production Loss/Hour", formatINR(loss.lossPerHour)],
                  ["Production Loss/Day", formatINR(loss.lossPerDay)],
                  ["Worker Idle Cost/Day", formatINR(loss.workerIdleCost)],
                ].map(([label, val]) => (
                  <div key={label} className="data-row">
                    <span className="data-label">{label}</span>
                    <span className="data-value" style={{ color: label.includes("Loss") || label.includes("Idle") ? "#f87171" : "#e2e8f0" }}>{val}</span>
                  </div>
                ))}

                <div className="divider" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Daily Loss</span>
                  <span style={{ fontSize: 20, fontFamily: "monospace", color: "#f87171", fontWeight: 800 }}>{formatINR(loss.totalLoss)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {items.filter(i => calcReorder(i).reorderQty > 0).length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(255,255,255,0.3)" }}>
            <p>✓ No critical stockouts detected. All items are within safe levels.</p>
          </div>
        )}
      </div>
    </div>
  );
}