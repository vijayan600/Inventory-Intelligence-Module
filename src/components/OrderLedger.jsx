import { useState, useEffect } from "react";
import { formatINR, calcReorder } from "../data/staticData";
import { fetchOrders, fetchSuppliers, fetchItems } from "../api";
import ReorderFormModal from "./ReorderFormModal";

export default function OrderLedger() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [poItem, setPoItem] = useState(null);
  const [submittedPOs, setSubmittedPOs] = useState([]);

  useEffect(() => {
    fetchItems().then(setItems);
    fetchOrders().then(setOrders);
    fetchSuppliers().then(setSuppliers);
  }, []);

  const handleSubmit = (formData) => {
    setSubmittedPOs(prev => {
      const existing = prev.findIndex(p => p.itemName === formData.itemName);
      if (existing >= 0) { const u = [...prev]; u[existing] = formData; return u; }
      return [...prev, formData];
    });
    setPoItem(null);
  };

  const totalPlanned  = orders.reduce((s, o) => s + o.planned, 0);
  const totalActual   = orders.reduce((s, o) => s + o.actual, 0);
  const totalVariance = totalActual - totalPlanned;
  const criticalItems = items.filter(i => calcReorder(i).reorderQty > 0);

  return (
    <div>
      {/* Orders Grid */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {orders.map((order) => {
          const variance = order.actual - order.planned;
          const isOver   = variance > 0;
          const ratio    = Math.min((order.actual / order.planned) * 100, 130);

          return (
            <div key={order.id} className="card" style={{ borderTop: `3px solid ${isOver ? "#8b1a1a" : "#1a5c38"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <p style={{ color: "#c9a84c", fontFamily: "monospace", fontWeight: 800, fontSize: 14 }}>{order.id}</p>
                <span className={`badge ${isOver ? "badge-loss" : "badge-saving"}`}>
                  {isOver ? "OVER BUDGET" : "UNDER BUDGET"}
                </span>
              </div>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 14, fontFamily: "monospace" }}>{order.date}</p>

              {[
                ["Planned Cost", formatINR(order.planned), "#e2e8f0"],
                ["Actual Cost",  formatINR(order.actual),  "#e2e8f0"],
                ["Variance", `${isOver ? "+" : ""}${formatINR(variance)}`, isOver ? "#f87171" : "#4ade80"],
              ].map(([label, val, color]) => (
                <div key={label} className="data-row">
                  <span className="data-label">{label}</span>
                  <span className="data-value" style={{ color, fontSize: 13 }}>{val}</span>
                </div>
              ))}

              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>ACTUAL VS PLANNED</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>{ratio.toFixed(0)}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{
                    width: `${Math.min(ratio, 100)}%`,
                    backgroundColor: isOver ? "#8b1a1a" : "#c9a84c",
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Variance Trend Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="section-title">◉ Cumulative Variance Trend</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16, fontFamily: "'Raleway',sans-serif" }}>
          Track variance direction across all orders — are we improving or deteriorating?
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "0 8px" }}>
          {orders.map((order) => {
            const variance    = order.actual - order.planned;
            const isOver      = variance > 0;
            const maxVariance = Math.max(...orders.map(o => Math.abs(o.actual - o.planned)));
            const barH        = Math.max(20, (Math.abs(variance) / maxVariance) * 100);

            return (
              <div key={order.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: isOver ? "#f87171" : "#4ade80" }}>
                  {isOver ? "+" : ""}{formatINR(variance)}
                </span>
                <div style={{
                  width: "100%", height: barH,
                  background: isOver
                    ? "linear-gradient(to top, #8b1a1a, rgba(139,26,26,0.4))"
                    : "linear-gradient(to top, #1a5c38, rgba(26,92,56,0.4))",
                  border: `1px solid ${isOver ? "#8b1a1a" : "#1a5c38"}`,
                  borderRadius: "3px 3px 0 0",
                  boxShadow: isOver ? "0 0 10px rgba(139,26,26,0.3)" : "0 0 10px rgba(26,92,56,0.3)",
                  transition: "all 0.5s ease",
                }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                  {order.id.slice(-3)}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 16, justifyContent: "center" }}>
          <span style={{ fontSize: 10, color: "#f87171", fontFamily: "monospace" }}>■ Over Budget</span>
          <span style={{ fontSize: 10, color: "#4ade80", fontFamily: "monospace" }}>■ Under Budget</span>
        </div>
      </div>

      {/* Supplier Scorecard */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="section-title">◆ Supplier Performance Scorecard</p>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Item</th>
                <th>Promised Lead</th>
                <th>Actual Lead</th>
                <th>Price Change</th>
                <th>Reliability</th>
                <th>Contact</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => {
                const late     = s.actualLead > s.promisedLead;
                const priceUp  = s.priceChange > 0;
                const grade    = s.reliability >= 9 ? "A+" : s.reliability >= 8 ? "A" : s.reliability >= 7 ? "B+" : s.reliability >= 6 ? "B" : "C";
                const gColor   = grade.startsWith("A") ? "#4ade80" : grade === "B+" ? "#c9a84c" : grade === "B" ? "#e8c97e" : "#f87171";

                return (
                  <tr key={s.name}>
                    <td style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12 }}>{s.name}</td>
                    <td>{s.item}</td>
                    <td>{s.promisedLead}d</td>
                    <td style={{ color: late ? "#f87171" : "#4ade80" }}>{s.actualLead}d {late ? "⚠" : "✓"}</td>
                    <td style={{ color: priceUp ? "#f87171" : "#4ade80" }}>{priceUp ? "+" : ""}{s.priceChange}%</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: gColor }}>{s.reliability}/10</span>
                        <div style={{ width: 50, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                          <div style={{ width: `${(s.reliability / 10) * 100}%`, height: 4, borderRadius: 99, background: gColor }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.contact}</td>
                    <td><span className="badge" style={{ color: gColor, borderColor: gColor, background: `${gColor}15` }}>{grade}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Purchase Order Generator ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="section-title">📋 One-Click Purchase Order Generator</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Raleway',sans-serif" }}>
          Click "Generate PO" to open a fully editable purchase order form with all fields pre-filled. You can edit every field before submitting.
        </p>

        {criticalItems.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>
            ✓ No purchase orders needed at this time.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {criticalItems.map((item) => {
              const { reorderQty } = calcReorder(item);
              const estimatedCost  = reorderQty * item.actual.rate;
              const supplier       = suppliers.find(s => s.item === item.name);
              const existingPO     = submittedPOs.find(po => po.itemName === item.name);

              return (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px",
                  background: existingPO ? "rgba(26,58,42,0.1)" : "rgba(201,168,76,0.04)",
                  border: `1px solid ${existingPO ? "rgba(26,92,56,0.3)" : "rgba(201,168,76,0.15)"}`,
                  borderRadius: 6, gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <p style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13 }}>{item.name}</p>
                      {existingPO && <span className="badge badge-saving">{existingPO.status}</span>}
                    </div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                      Qty: +{reorderQty} {item.unit} · Supplier: {supplier?.name} · Est. Cost: {formatINR(estimatedCost)}
                      {existingPO && ` · PO: ${existingPO.poNumber}`}
                    </p>
                  </div>
                  <button onClick={() => setPoItem(item)} style={{
                    padding: "9px 20px",
                    background: existingPO ? "rgba(26,58,42,0.3)" : "rgba(201,168,76,0.12)",
                    border: `1px solid ${existingPO ? "rgba(26,92,56,0.5)" : "rgba(201,168,76,0.35)"}`,
                    color: existingPO ? "#4ade80" : "#c9a84c",
                    borderRadius: 4, cursor: "pointer", fontSize: 10,
                    fontFamily: "'Cinzel',serif", letterSpacing: "0.12em",
                    textTransform: "uppercase", whiteSpace: "nowrap", transition: "all 0.2s",
                  }}>
                    {existingPO ? "✓ Edit PO" : "Generate PO"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Master Summary */}
      <div className="card" style={{ border: "1px solid rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.04)" }}>
        <p className="section-title">◆ Master Financial Summary</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 20 }}>
          {[
            ["Total Planned",   formatINR(totalPlanned),   "#c9a84c"],
            ["Total Actual",    formatINR(totalActual),    "#c9a84c"],
            ["Net Variance",    `${totalVariance > 0 ? "+" : ""}${formatINR(totalVariance)}`, totalVariance > 0 ? "#f87171" : "#4ade80"],
            ["Orders Analyzed", orders.length,             "#c9a84c"],
            ["Over Budget",     orders.filter(o => o.actual > o.planned).length,  "#f87171"],
            ["Under Budget",    orders.filter(o => o.actual <= o.planned).length, "#4ade80"],
          ].map(([label, val, color]) => (
            <div key={label} style={{ textAlign: "center", padding: "10px 0" }}>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Cinzel',serif" }}>{label}</p>
              <p style={{ fontSize: 22, fontFamily: "monospace", fontWeight: 800, color, textShadow: `0 0 12px ${color}40` }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Modal */}
      {poItem && (
        <ReorderFormModal
          item={poItem}
          onClose={() => setPoItem(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}