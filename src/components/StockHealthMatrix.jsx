import { useState, useEffect } from "react";
import { calcReorder } from "../data/staticData";
import { fetchItems } from "../api";

export default function StockHealthMatrix() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems().then(setItems);
  }, []);

  return (
    <div className="card">
      <p className="section-title">◈ Stock Health Matrix</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((item) => {
          const { reorderLevel, coverageDays } = calcReorder(item);
          const pct = Math.min((item.inventory.current / reorderLevel) * 100, 100);
          const isCritical = item.inventory.current < reorderLevel;

          return (
            <div key={item.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: isCritical ? "#f87171" : "#c9a84c", fontFamily: "'Cinzel',serif" }}>
                  {item.name}
                </span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>
                    {item.inventory.current} / {reorderLevel} {item.unit}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: isCritical ? "#f87171" : "#4ade80" }}>
                    {coverageDays}d
                  </span>
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{
                  width: `${pct}%`,
                  backgroundColor: isCritical ? "#8b1a1a" : "#c9a84c",
                  boxShadow: isCritical ? "0 0 8px rgba(139,26,26,0.7)" : "0 0 8px rgba(201,168,76,0.5)",
                }} />
              </div>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 3, fontFamily: "monospace" }}>
                {pct.toFixed(0)}% of reorder level · {isCritical ? "⚠ ACTION REQUIRED" : "✓ Safe"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}