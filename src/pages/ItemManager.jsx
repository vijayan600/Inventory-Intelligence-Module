import { useState, useEffect } from "react";
import { formatINR } from "../data/staticData";
import { fetchItems, createItem, updateItem, deleteItem } from "../api";
import ItemFormModal from "../components/ItemFormModal";

export default function ItemManager() {
  const [items, setItems] = useState([]);
  const [modalItem, setModalItem] = useState(null);   // null=closed, "new"=add, item=edit
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchItems().then(data => { setItems(data); setLoading(false); });
  };
  useEffect(load, []);

  const handleSave = async (payload, editId) => {
    if (editId) {
      await updateItem(editId, payload);
    } else {
      await createItem(payload);
    }
    setModalItem(null);
    load();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteItem(id);
    load();
  };

  /* compute live summary */
  const totalPlanned = items.reduce((s, i) => s + (i.planned?.qty || 0) * (i.planned?.rate || 0), 0);
  const totalActual  = items.reduce((s, i) => s + (i.actual?.qty || 0) * (i.actual?.rate || 0), 0);
  const totalVariance = totalActual - totalPlanned;
  const criticalCount = items.filter(i => {
    const rl = (i.inventory?.daily || 0) * (i.inventory?.lead || 0) + (i.inventory?.safety || 0);
    return (i.inventory?.current || 0) < rl;
  }).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header bar */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px" }}>
        <div>
          <p className="section-title" style={{ marginBottom: 4 }}>✎ Item & Production Data Entry</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Raleway',sans-serif" }}>
            Add, edit, or remove inventory items. Enter planned BOM, actual consumption, and stock data.
          </p>
        </div>
        <button
          onClick={() => setModalItem("new")}
          style={{
            padding: "10px 24px",
            background: "rgba(201,168,76,0.12)",
            border: "1px solid rgba(201,168,76,0.5)",
            color: "#c9a84c",
            borderRadius: 5,
            cursor: "pointer",
            fontSize: 11,
            fontFamily: "'Cinzel',serif",
            letterSpacing: "0.14em",
            fontWeight: 700,
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { e.target.style.background = "rgba(201,168,76,0.22)"; e.target.style.boxShadow = "0 0 14px rgba(201,168,76,0.2)"; }}
          onMouseLeave={e => { e.target.style.background = "rgba(201,168,76,0.12)"; e.target.style.boxShadow = "none"; }}
        >
          + Add New Item
        </button>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          ["Total Items", items.length, "#c9a84c"],
          ["Total Planned", formatINR(totalPlanned), "#e2e8f0"],
          ["Total Actual", formatINR(totalActual), "#e2e8f0"],
          ["Need Reorder", `${criticalCount} items`, criticalCount > 0 ? "#f87171" : "#4ade80"],
        ].map(([label, val, color]) => (
          <div key={label} className="card" style={{ textAlign: "center", padding: "14px 10px" }}>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 800, color }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Items Table */}
      <div className="card" style={{ overflowX: "auto" }}>
        <p className="section-title" style={{ marginBottom: 14 }}>◆ Inventory Items Register</p>

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 30 }}>Loading...</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 12 }}>No items yet. Add your first inventory item.</p>
            <button
              onClick={() => setModalItem("new")}
              style={{
                padding: "10px 28px",
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#c9a84c",
                borderRadius: 5,
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'Cinzel',serif",
                letterSpacing: "0.12em",
              }}
            >
              + Add Item
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {["#", "Item", "Unit", "Pl.Qty", "Pl.Rate", "Planned ₹", "Ac.Qty", "Ac.Rate", "Actual ₹", "Variance", "Stock", "Reorder Lvl", "Status", "Actions"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const pAmt = (item.planned?.qty || 0) * (item.planned?.rate || 0);
                const aAmt = (item.actual?.qty || 0) * (item.actual?.rate || 0);
                const v    = aAmt - pAmt;
                const rl   = (item.inventory?.daily || 0) * (item.inventory?.lead || 0) + (item.inventory?.safety || 0);
                const needsReorder = (item.inventory?.current || 0) < rl;

                return (
                  <tr key={item.id} className={v > 0 ? "loss-row" : "save-row"}>
                    <td style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{item.id}</td>
                    <td style={{ color: "#c9a84c", fontWeight: 700, fontFamily: "'Cinzel',serif", fontSize: 12 }}>{item.name}</td>
                    <td>{item.unit}</td>
                    <td>{item.planned?.qty}</td>
                    <td>₹{item.planned?.rate}</td>
                    <td style={{ color: "#e2e8f0" }}>{formatINR(pAmt)}</td>
                    <td>{item.actual?.qty}</td>
                    <td>₹{item.actual?.rate}</td>
                    <td style={{ color: "#e2e8f0" }}>{formatINR(aAmt)}</td>
                    <td style={{ color: v > 0 ? "#f87171" : "#4ade80", fontWeight: 700 }}>
                      {v > 0 ? "+" : ""}{formatINR(v)}
                    </td>
                    <td style={{ color: needsReorder ? "#f87171" : "#e2e8f0" }}>
                      {item.inventory?.current} {item.unit}
                    </td>
                    <td>{rl} {item.unit}</td>
                    <td>
                      <span className={`badge ${needsReorder ? "badge-critical" : "badge-stable"}`}>
                        {needsReorder ? "REORDER" : "SAFE"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setModalItem(item)}
                          style={{
                            padding: "4px 12px",
                            background: "rgba(201,168,76,0.08)",
                            border: "1px solid rgba(201,168,76,0.25)",
                            color: "#c9a84c",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 9,
                            fontFamily: "'Cinzel',serif",
                            letterSpacing: "0.08em",
                          }}
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          style={{
                            padding: "4px 10px",
                            background: "rgba(139,26,26,0.08)",
                            border: "1px solid rgba(139,26,26,0.25)",
                            color: "#f87171",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 9,
                            fontFamily: "'Cinzel',serif",
                            letterSpacing: "0.08em",
                          }}
                        >Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* System Flow Guide */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: 12 }}>⚙ System Flow</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            "1. Enter Production Plan",
            "2. Enter Actual Usage",
            "3. Calculate Variance",
            "4. Check Stock Levels",
            "5. Predict Shortage",
            "6. Generate Reorder Qty",
            "7. Display Alerts",
          ].map((step, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                padding: "6px 14px",
                background: i <= 1 ? "rgba(201,168,76,0.12)" : "rgba(26,58,42,0.15)",
                border: `1px solid ${i <= 1 ? "rgba(201,168,76,0.3)" : "rgba(26,58,42,0.3)"}`,
                borderRadius: 5,
                color: i <= 1 ? "#c9a84c" : "#4ade80",
                fontSize: 10,
                fontFamily: "monospace",
                whiteSpace: "nowrap",
              }}>
                {step}
              </span>
              {i < 6 && <span style={{ color: "rgba(255,255,255,0.15)" }}>→</span>}
            </div>
          ))}
        </div>
        <p style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'Raleway',sans-serif" }}>
          Steps 1–2 are done here. Steps 3–7 are automated across the other tabs.
        </p>
      </div>

      {/* Modal */}
      {modalItem && (
        <ItemFormModal
          item={modalItem === "new" ? null : modalItem}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
