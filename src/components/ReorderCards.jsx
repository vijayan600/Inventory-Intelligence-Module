import { useState } from "react";
import { items, calcReorder } from "../data/staticData";
import ReorderFormModal from "./ReorderFormModal";

function formatDate(date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function ReorderCards() {
  const [modalItem, setModalItem] = useState(null);
  const [submittedPOs, setSubmittedPOs] = useState([]);

  const handleSubmit = (formData) => {
    setSubmittedPOs(prev => {
      const existing = prev.findIndex(p => p.itemName === formData.itemName);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = formData;
        return updated;
      }
      return [...prev, formData];
    });
    setModalItem(null);
  };

  return (
    <div>
      {/* Submitted POs Banner */}
      {submittedPOs.length > 0 && (
        <div style={{
          marginBottom: 16,
          padding: "12px 18px",
          background: "rgba(26,58,42,0.2)",
          border: "1px solid rgba(26,92,56,0.4)",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}>
          <p style={{ color: "#4ade80", fontSize: 12, fontFamily: "monospace" }}>
            ✓ {submittedPOs.length} Purchase Order{submittedPOs.length > 1 ? "s" : ""} submitted this session
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {submittedPOs.map((po, i) => (
              <span key={i} className="badge badge-saving">{po.poNumber} · {po.status}</span>
            ))}
          </div>
        </div>
      )}

      {/* Reorder Cards Grid */}
      <div className="grid-5" style={{ marginBottom: 24 }}>
        {items.map((item) => {
          const { reorderLevel, reorderQty, coverageDays, orderByDate, deliveryDate } = calcReorder(item);
          const isCritical = reorderQty > 0;
          const pct = Math.min((item.inventory.current / reorderLevel) * 100, 100);
          const existingPO = submittedPOs.find(po => po.itemName === item.name);

          return (
            <div key={item.id} className={`card ${isCritical ? "card-critical" : ""}`} style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <p style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13 }}>
                  {item.name}
                </p>
                <span className={`badge ${existingPO ? "badge-saving" : isCritical ? "badge-critical" : "badge-stable"}`}>
                  {existingPO ? "PO RAISED" : isCritical ? "REORDER" : "STABLE"}
                </span>
              </div>

              {[
                ["Current Stock", `${item.inventory.current} ${item.unit}`],
                ["Daily Usage",   `${item.inventory.daily} ${item.unit}/day`],
                ["Reorder Level", `${reorderLevel} ${item.unit}`],
                ["Suggested Qty", isCritical ? `+${reorderQty} ${item.unit}` : "Not Required"],
                ["Coverage",      `${coverageDays} days`],
              ].map(([label, val]) => (
                <div key={label} className="data-row">
                  <span className="data-label">{label}</span>
                  <span className="data-value" style={{
                    color: label === "Suggested Qty" && isCritical ? "#f87171" : "#e2e8f0",
                    fontSize: 11,
                  }}>{val}</span>
                </div>
              ))}

              {/* Progress Bar */}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>STOCK LEVEL</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{pct.toFixed(0)}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{
                    width: `${pct}%`,
                    backgroundColor: isCritical ? "#8b1a1a" : "#c9a84c",
                    boxShadow: isCritical ? "0 0 8px rgba(139,26,26,0.6)" : "0 0 8px rgba(201,168,76,0.4)",
                  }} />
                </div>
              </div>

              {/* Schedule */}
              {isCritical && (
                <div style={{ marginTop: 12, padding: "8px 10px", background: "rgba(139,26,26,0.12)", borderRadius: 4, border: "1px solid rgba(139,26,26,0.25)" }}>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 4, fontFamily: "monospace" }}>SCHEDULE</p>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Order By</p>
                      <p style={{ fontSize: 11, color: "#f87171", fontFamily: "monospace" }}>{formatDate(orderByDate)}</p>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.2)", alignSelf: "center" }}>→</div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Delivery</p>
                      <p style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace" }}>{formatDate(deliveryDate)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ACTION BUTTON ── */}
              {isCritical && (
                <button
                  onClick={() => setModalItem(item)}
                  style={{
                    marginTop: 14, width: "100%", padding: "10px 0",
                    background: existingPO ? "rgba(26,58,42,0.3)" : "rgba(139,26,26,0.2)",
                    border: `1px solid ${existingPO ? "rgba(26,92,56,0.5)" : "rgba(139,26,26,0.5)"}`,
                    color: existingPO ? "#4ade80" : "#f87171",
                    borderRadius: 5, cursor: "pointer", fontSize: 10,
                    fontFamily: "'Cinzel',serif", letterSpacing: "0.14em",
                    textTransform: "uppercase", transition: "all 0.25s",
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = existingPO ? "rgba(26,58,42,0.5)" : "rgba(139,26,26,0.4)";
                    e.target.style.boxShadow = `0 0 14px ${existingPO ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`;
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = existingPO ? "rgba(26,58,42,0.3)" : "rgba(139,26,26,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {existingPO ? "✓ View / Edit PO" : "⚑ Create Reorder Form"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Scheduling Calendar Table */}
      <div className="card">
        <p className="section-title">📅 Smart Reorder Scheduling Calendar</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Raleway',sans-serif" }}>
          Sorted by urgency. Click "Create PO" on any row to open the full purchase order form.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Coverage</th>
                <th>Stockout</th>
                <th>Order By</th>
                <th>Lead Time</th>
                <th>Delivery</th>
                <th>Urgency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[...items].sort((a, b) => calcReorder(a).coverageDays - calcReorder(b).coverageDays).map((item) => {
                const { coverageDays, reorderQty, stockoutDate, orderByDate, deliveryDate } = calcReorder(item);
                const isOverdue = new Date() >= orderByDate;
                const isSoon    = coverageDays <= item.inventory.lead + 2;
                const urgency   = isOverdue ? "OVERDUE" : isSoon ? "THIS WEEK" : "UPCOMING";
                const uColor    = isOverdue ? "#f87171" : isSoon ? "#c9a84c" : "#4ade80";
                const existingPO = submittedPOs.find(po => po.itemName === item.name);

                return (
                  <tr key={item.id} className={reorderQty > 0 ? "loss-row" : ""}>
                    <td style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12 }}>{item.name}</td>
                    <td style={{ color: coverageDays <= 3 ? "#f87171" : "#e2e8f0" }}>{coverageDays}d</td>
                    <td style={{ color: "#f87171" }}>{formatDate(stockoutDate)}</td>
                    <td style={{ color: isOverdue ? "#f87171" : "#c9a84c", fontWeight: 700 }}>{formatDate(orderByDate)}</td>
                    <td>{item.inventory.lead}d</td>
                    <td style={{ color: "#4ade80" }}>{formatDate(deliveryDate)}</td>
                    <td><span className="badge" style={{ color: uColor, borderColor: uColor, background: `${uColor}15` }}>{urgency}</span></td>
                    <td>
                      {reorderQty > 0 ? (
                        <button onClick={() => setModalItem(item)} style={{
                          padding: "5px 12px",
                          background: existingPO ? "rgba(26,58,42,0.3)" : "rgba(201,168,76,0.1)",
                          border: `1px solid ${existingPO ? "rgba(26,92,56,0.4)" : "rgba(201,168,76,0.3)"}`,
                          color: existingPO ? "#4ade80" : "#c9a84c",
                          borderRadius: 4, cursor: "pointer", fontSize: 9,
                          fontFamily: "'Cinzel',serif", letterSpacing: "0.1em",
                          textTransform: "uppercase", transition: "all 0.2s", whiteSpace: "nowrap",
                        }}>
                          {existingPO ? "✓ Edit PO" : "Create PO"}
                        </button>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {modalItem && (
        <ReorderFormModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}