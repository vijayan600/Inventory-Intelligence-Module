import { useState } from "react";

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(201,168,76,0.2)",
  borderRadius: 5,
  color: "#e2e8f0",
  fontSize: 12,
  fontFamily: "'Share Tech Mono', monospace",
  outline: "none",
  transition: "border-color 0.2s",
};

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block",
        fontSize: 9,
        fontFamily: "'Cinzel',serif",
        color: "rgba(201,168,76,0.7)",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: 5,
      }}>
        {label}{required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const EMPTY = {
  name: "",
  unit: "kg",
  planned_qty: "",
  planned_rate: "",
  actual_qty: "",
  actual_rate: "",
  current_stock: "",
  minimum_stock: "",
  daily_consumption: "",
  lead_time_days: "",
  safety_stock: "",
  supplier_name: "",
  production_value: "",
  worker_cost: "",
  delay_history: "0",
};

export default function ItemFormModal({ item, onClose, onSave }) {
  const isEdit = !!item;
  const [form, setForm] = useState(() => {
    if (item) {
      // Accept both flat (API) and nested (transformed) formats
      return {
        name: item.name,
        unit: item.unit,
        planned_qty: String(item.planned_qty ?? item.planned?.qty ?? ""),
        planned_rate: String(item.planned_rate ?? item.planned?.rate ?? ""),
        actual_qty: String(item.actual_qty ?? item.actual?.qty ?? ""),
        actual_rate: String(item.actual_rate ?? item.actual?.rate ?? ""),
        current_stock: String(item.current_stock ?? item.inventory?.current ?? ""),
        minimum_stock: String(item.minimum_stock ?? item.inventory?.minimum ?? ""),
        daily_consumption: String(item.daily_consumption ?? item.inventory?.daily ?? ""),
        lead_time_days: String(item.lead_time_days ?? item.inventory?.lead ?? ""),
        safety_stock: String(item.safety_stock ?? item.inventory?.safety ?? ""),
        supplier_name: item.supplier_name ?? item.supplier ?? "",
        production_value: String(item.production_value ?? item.productionValue ?? ""),
        worker_cost: String(item.worker_cost ?? item.workerCost ?? ""),
        delay_history: String(item.delay_history ?? item.delayHistory ?? "0"),
      };
    }
    return { ...EMPTY };
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.planned_qty || Number(form.planned_qty) <= 0) e.planned_qty = true;
    if (!form.planned_rate || Number(form.planned_rate) <= 0) e.planned_rate = true;
    if (!form.actual_qty || Number(form.actual_qty) < 0) e.actual_qty = true;
    if (!form.actual_rate || Number(form.actual_rate) < 0) e.actual_rate = true;
    if (!form.current_stock || Number(form.current_stock) < 0) e.current_stock = true;
    if (!form.daily_consumption || Number(form.daily_consumption) <= 0) e.daily_consumption = true;
    if (!form.lead_time_days || Number(form.lead_time_days) <= 0) e.lead_time_days = true;
    if (!form.safety_stock || Number(form.safety_stock) < 0) e.safety_stock = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      unit: form.unit,
      planned_qty: Number(form.planned_qty),
      planned_rate: Number(form.planned_rate),
      actual_qty: Number(form.actual_qty),
      actual_rate: Number(form.actual_rate),
      current_stock: Number(form.current_stock),
      minimum_stock: Number(form.minimum_stock || 0),
      daily_consumption: Number(form.daily_consumption),
      lead_time_days: Number(form.lead_time_days),
      safety_stock: Number(form.safety_stock),
      supplier_name: form.supplier_name.trim(),
      production_value: Number(form.production_value || 0),
      worker_cost: Number(form.worker_cost || 0),
      delay_history: Number(form.delay_history || 0),
    };
    await onSave(payload, item?.id);
    setSaving(false);
  };

  const sections = [
    {
      title: "A · Production Planning (BOM)",
      icon: "◎",
      fields: [
        { key: "name", label: "Item Name", type: "text", required: true },
        { key: "unit", label: "Unit of Measure", type: "select", options: ["kg", "cones", "pcs", "meters", "liters", "sets"] },
        { key: "planned_qty", label: "Planned Quantity", type: "number", required: true },
        { key: "planned_rate", label: "Planned Rate (₹)", type: "number", required: true },
      ],
    },
    {
      title: "B · Actual Consumption",
      icon: "◈",
      fields: [
        { key: "actual_qty", label: "Actual Quantity Used", type: "number", required: true },
        { key: "actual_rate", label: "Actual Rate (₹)", type: "number", required: true },
      ],
    },
    {
      title: "C · Inventory Control",
      icon: "⚑",
      fields: [
        { key: "current_stock", label: "Current Stock", type: "number", required: true },
        { key: "minimum_stock", label: "Minimum Stock", type: "number" },
        { key: "daily_consumption", label: "Daily Consumption (avg)", type: "number", required: true },
        { key: "lead_time_days", label: "Supplier Lead Time (days)", type: "number", required: true },
        { key: "safety_stock", label: "Safety Stock", type: "number", required: true },
        { key: "supplier_name", label: "Supplier Name", type: "text" },
      ],
    },
    {
      title: "D · Production Cost Info",
      icon: "◆",
      fields: [
        { key: "production_value", label: "Production Value (₹/hr)", type: "number" },
        { key: "worker_cost", label: "Worker Cost (₹/day)", type: "number" },
        { key: "delay_history", label: "Delay History (incidents)", type: "number" },
      ],
    },
  ];

  /* live preview */
  const pAmt = (Number(form.planned_qty) || 0) * (Number(form.planned_rate) || 0);
  const aAmt = (Number(form.actual_qty) || 0) * (Number(form.actual_rate) || 0);
  const variance = aAmt - pAmt;
  const daily = Number(form.daily_consumption) || 0;
  const lead = Number(form.lead_time_days) || 0;
  const safety = Number(form.safety_stock) || 0;
  const stock = Number(form.current_stock) || 0;
  const reorderLevel = daily * lead + safety;
  const reorderQty = reorderLevel - stock;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(6px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(145deg, #0d1526, #080d1c)",
        border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: 10,
        width: "90%",
        maxWidth: 780,
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(201,168,76,0.2)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "linear-gradient(135deg, #080d1c, #0d1526)",
          borderRadius: "10px 10px 0 0",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#c9a84c", fontSize: 22 }}>♛</span>
            <div>
              <p style={{ fontFamily: "'Cinzel',serif", color: "#c9a84c", fontWeight: 700, fontSize: 14, letterSpacing: "0.15em" }}>
                {isEdit ? `EDIT ITEM — ${item.name.toUpperCase()}` : "ADD NEW INVENTORY ITEM"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace", marginTop: 2 }}>
                {isEdit ? "Update production plan, actual usage, or inventory data" : "Enter production plan, actual consumption & inventory control data"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid rgba(201,168,76,0.2)", color: "#c9a84c",
            width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 14,
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Left — form sections */}
          <div>
            {sections.map(sec => (
              <div key={sec.title} style={{ marginBottom: 22 }}>
                <p style={{
                  fontSize: 11, fontFamily: "'Cinzel',serif", color: "#c9a84c",
                  letterSpacing: "0.12em", marginBottom: 10,
                  borderBottom: "1px solid rgba(201,168,76,0.12)", paddingBottom: 6,
                }}>
                  {sec.icon} {sec.title}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: sec.fields.length <= 2 ? "1fr 1fr" : "1fr 1fr", gap: "0 14px" }}>
                  {sec.fields.map(f => (
                    <Field key={f.key} label={f.label} required={f.required}>
                      {f.type === "select" ? (
                        <select
                          value={form[f.key]}
                          onChange={e => set(f.key, e.target.value)}
                          style={{
                            ...inputStyle, cursor: "pointer", appearance: "none",
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23c9a84c'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28,
                          }}
                        >
                          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={f.type}
                          value={form[f.key]}
                          onChange={e => set(f.key, e.target.value)}
                          style={{
                            ...inputStyle,
                            borderColor: errors[f.key] ? "#f87171" : "rgba(201,168,76,0.2)",
                          }}
                          placeholder={f.label}
                          step={f.type === "number" ? "any" : undefined}
                        />
                      )}
                    </Field>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right — live preview */}
          <div>
            <div style={{
              position: "sticky", top: 80,
              padding: 18, background: "rgba(201,168,76,0.04)",
              border: "1px solid rgba(201,168,76,0.15)", borderRadius: 8,
            }}>
              <p style={{
                fontSize: 10, fontFamily: "'Cinzel',serif", color: "#c9a84c",
                letterSpacing: "0.15em", marginBottom: 14,
              }}>
                LIVE CALCULATION PREVIEW
              </p>

              {/* Variance */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 8 }}>
                  COST VARIANCE
                </p>
                {[
                  ["Planned Amount", `₹${pAmt.toLocaleString("en-IN")}`],
                  ["Actual Amount", `₹${aAmt.toLocaleString("en-IN")}`],
                  ["Variance", `${variance >= 0 ? "+" : ""}₹${variance.toLocaleString("en-IN")}`],
                ].map(([label, val]) => (
                  <div key={label} className="data-row">
                    <span className="data-label">{label}</span>
                    <span className="data-value" style={{
                      fontSize: 12,
                      color: label === "Variance" ? (variance > 0 ? "#f87171" : variance < 0 ? "#4ade80" : "#e2e8f0") : "#e2e8f0",
                      fontWeight: label === "Variance" ? 700 : 400,
                    }}>{val}</span>
                  </div>
                ))}
                {variance !== 0 && (
                  <div style={{ marginTop: 6, textAlign: "center" }}>
                    <span className={`badge ${variance > 0 ? "badge-loss" : "badge-saving"}`}>
                      {variance > 0 ? "LOSS" : "SAVING"}
                    </span>
                  </div>
                )}
              </div>

              <div className="divider" />

              {/* Reorder */}
              <div>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 8 }}>
                  REORDER PREDICTION
                </p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginBottom: 10 }}>
                  ({daily} × {lead}) + {safety} = {reorderLevel}
                </p>
                {[
                  ["Reorder Level", `${reorderLevel} ${form.unit}`],
                  ["Current Stock", `${stock} ${form.unit}`],
                  ["Reorder Qty", reorderQty > 0 ? `+${reorderQty} ${form.unit}` : "Not required"],
                  ["Coverage", daily > 0 ? `${(stock / daily).toFixed(1)} days` : "—"],
                ].map(([label, val]) => (
                  <div key={label} className="data-row">
                    <span className="data-label">{label}</span>
                    <span className="data-value" style={{
                      fontSize: 12,
                      color: label === "Reorder Qty" && reorderQty > 0 ? "#f87171" : "#e2e8f0",
                      fontWeight: label === "Reorder Qty" ? 700 : 400,
                    }}>{val}</span>
                  </div>
                ))}
                {reorderQty > 0 && (
                  <div style={{
                    marginTop: 10, padding: "8px 12px",
                    background: "rgba(139,26,26,0.15)", border: "1px solid rgba(139,26,26,0.3)", borderRadius: 5,
                    textAlign: "center",
                  }}>
                    <p style={{ fontSize: 11, color: "#f87171", fontFamily: "monospace", fontWeight: 700 }}>
                      ⚠ REORDER ALERT — Order {reorderQty} {form.unit} now
                    </p>
                  </div>
                )}
                {reorderQty <= 0 && daily > 0 && (
                  <div style={{
                    marginTop: 10, padding: "8px 12px",
                    background: "rgba(26,58,42,0.15)", border: "1px solid rgba(26,58,42,0.3)", borderRadius: 5,
                    textAlign: "center",
                  }}>
                    <p style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace" }}>
                      ✓ Stock levels safe
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(201,168,76,0.15)",
          display: "flex", justifyContent: "flex-end", gap: 12,
          position: "sticky", bottom: 0,
          background: "linear-gradient(135deg, #0d1526, #080d1c)",
        }}>
          <button onClick={onClose} style={{
            padding: "9px 22px", background: "transparent",
            border: "1px solid rgba(201,168,76,0.25)", color: "rgba(255,255,255,0.5)",
            borderRadius: 5, cursor: "pointer", fontSize: 11,
            fontFamily: "'Cinzel',serif", letterSpacing: "0.1em",
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            padding: "9px 28px",
            background: saving ? "rgba(201,168,76,0.1)" : "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.5)", color: "#c9a84c",
            borderRadius: 5, cursor: saving ? "default" : "pointer", fontSize: 11,
            fontFamily: "'Cinzel',serif", letterSpacing: "0.12em", fontWeight: 700,
            transition: "all 0.2s",
          }}>
            {saving ? "Saving..." : isEdit ? "Update Item" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
