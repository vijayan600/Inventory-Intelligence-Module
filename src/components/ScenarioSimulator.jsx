import { useState, useEffect } from "react";
import { formatINR } from "../data/staticData";
import { fetchReorderAlerts } from "../api";

export default function ScenarioSimulator() {
  const [items, setItems] = useState([]);
  const [consumptionIncrease, setConsumptionIncrease] = useState(0);
  const [leadTimeIncrease, setLeadTimeIncrease] = useState(0);
  const [rateIncrease, setRateIncrease] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);

  useEffect(() => {
    fetchReorderAlerts().then(setItems);
  }, []);

  if (items.length === 0) return null;

  const item = items[selectedItem];

  const simDaily = item.daily_usage * (1 + consumptionIncrease / 100);
  const simLead = item.lead_time + leadTimeIncrease;
  const simRate = item.actual_rate * (1 + rateIncrease / 100);

  const simReorderLevel = Math.round(simDaily * simLead + item.safety_stock);
  const simReorderQty = simReorderLevel - item.current_stock;
  const simCoverDays = parseFloat((item.current_stock / simDaily).toFixed(1));
  const simCost = item.actual_qty * simRate;
  const origCost = item.actual_qty * item.actual_rate;
  const costImpact = simCost - origCost;

  const origReorderLevel = item.reorder_level;
  const newStatus = simReorderQty > 0 ? "REORDER REQUIRED" : "STABLE";

  const sliders = [
    {
      label: "Daily Consumption Increase",
      value: consumptionIncrease,
      set: setConsumptionIncrease,
      min: 0, max: 100, step: 5,
      unit: "%",
      hint: `${item.daily_usage} → ${simDaily.toFixed(0)} ${item.unit}/day`,
    },
    {
      label: "Lead Time Increase",
      value: leadTimeIncrease,
      set: setLeadTimeIncrease,
      min: 0, max: 10, step: 1,
      unit: " days",
      hint: `${item.lead_time} → ${simLead} days`,
    },
    {
      label: "Rate Increase",
      value: rateIncrease,
      set: setRateIncrease,
      min: 0, max: 50, step: 1,
      unit: "%",
      hint: `₹${item.actual_rate} → ₹${simRate.toFixed(0)}`,
    },
  ];

  return (
    <div className="card">
      <p className="section-title">⚙ What-If Scenario Simulator</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Raleway',sans-serif" }}>
        Adjust the sliders to simulate business scenarios and instantly see the financial and operational impact.
      </p>

      {/* Item Selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {items.map((it, i) => (
          <button key={i} onClick={() => setSelectedItem(i)} style={{
            padding: "6px 16px",
            borderRadius: 4,
            border: `1px solid ${selectedItem === i ? "#c9a84c" : "rgba(201,168,76,0.2)"}`,
            background: selectedItem === i ? "rgba(201,168,76,0.12)" : "transparent",
            color: selectedItem === i ? "#c9a84c" : "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontSize: 11,
            fontFamily: "'Cinzel',serif",
            letterSpacing: "0.08em",
            transition: "all 0.2s",
          }}>
            {it.name}
          </button>
        ))}
      </div>

      <div className="grid-2">
        {/* Sliders */}
        <div>
          {sliders.map((s) => {
            const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
            return (
              <div key={s.label} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'Raleway',sans-serif" }}>{s.label}</span>
                  <span style={{ fontSize: 13, color: "#c9a84c", fontFamily: "monospace", fontWeight: 700 }}>
                    +{s.value}{s.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  style={{ "--pct": `${pct}%` }}
                />
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4, fontFamily: "monospace" }}>{s.hint}</p>
              </div>
            );
          })}

          <button onClick={() => { setConsumptionIncrease(0); setLeadTimeIncrease(0); setRateIncrease(0); }} style={{
            padding: "8px 20px",
            border: "1px solid rgba(201,168,76,0.3)",
            background: "transparent",
            color: "#c9a84c",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 10,
            fontFamily: "'Cinzel',serif",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            transition: "all 0.2s",
          }}>
            Reset Simulation
          </button>
        </div>

        {/* Results */}
        <div>
          <div style={{ padding: 16, background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, marginBottom: 14 }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 12, fontFamily: "'Cinzel',serif" }}>
              SIMULATION RESULTS — {item.name.toUpperCase()}
            </p>

            {[
              ["Original Reorder Level", `${origReorderLevel} ${item.unit}`, "#e2e8f0"],
              ["Simulated Reorder Level", `${simReorderLevel} ${item.unit}`, simReorderLevel > origReorderLevel ? "#f87171" : "#4ade80"],
              ["Simulated Coverage", `${simCoverDays} days`, simCoverDays < item.lead_time ? "#f87171" : "#4ade80"],
              ["Suggested Order Qty", simReorderQty > 0 ? `+${simReorderQty} ${item.unit}` : "Not Required", simReorderQty > 0 ? "#f87171" : "#4ade80"],
              ["Rate Cost Impact", `${costImpact >= 0 ? "+" : ""}${formatINR(costImpact)}`, costImpact > 0 ? "#f87171" : "#4ade80"],
            ].map(([label, val, color]) => (
              <div key={label} className="data-row">
                <span className="data-label">{label}</span>
                <span className="data-value" style={{ color, fontSize: 12 }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{
            padding: 14,
            background: simReorderQty > 0 ? "rgba(139,26,26,0.15)" : "rgba(26,58,42,0.15)",
            border: `1px solid ${simReorderQty > 0 ? "rgba(139,26,26,0.4)" : "rgba(26,58,42,0.4)"}`,
            borderRadius: 8,
            textAlign: "center",
          }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>SIMULATED STATUS</p>
            <p style={{
              fontSize: 18,
              fontFamily: "monospace",
              fontWeight: 800,
              color: simReorderQty > 0 ? "#f87171" : "#4ade80",
            }}>
              {newStatus}
            </p>
            {costImpact > 0 && (
              <p style={{ fontSize: 11, color: "#f87171", marginTop: 8 }}>
                ⚠ Extra cost of {formatINR(costImpact)} under this scenario
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}