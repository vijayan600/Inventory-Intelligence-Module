import { useState, useEffect } from "react";
import { formatINR } from "../data/staticData";
import { fetchSuppliers } from "../api";

const STATUS_OPTIONS = ["Draft", "Pending Approval", "Approved", "Ordered", "Delivered", "Cancelled"];
const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];
const PAYMENT_OPTIONS = ["Immediate", "Net 7", "Net 15", "Net 30", "Advance"];

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block",
        fontSize: 9,
        fontFamily: "'Cinzel',serif",
        color: "rgba(201,168,76,0.7)",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: 6,
      }}>
        {label}{required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

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

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23c9a84c'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: 28,
};

export default function ReorderFormModal({ item, onClose, onSubmit }) {
  const [suppliers, setSuppliersData] = useState([]);
  const reorderQty = item.suggested_reorder_qty ?? 0;
  const reorderLevel = item.reorder_level ?? 0;
  const coverageDays = item.coverage_days ?? 0;
  const deliveryDate = item.delivery_date ? new Date(item.delivery_date) : new Date();
  const orderByDate = item.order_by_date ? new Date(item.order_by_date) : new Date();

  useEffect(() => {
    fetchSuppliers().then(setSuppliersData);
  }, []);

  const supplier = suppliers.find(s => s.item === item.name) || {};

  const today = new Date().toISOString().split("T")[0];
  const deliveryStr = deliveryDate.toISOString().split("T")[0];
  const orderByStr  = orderByDate.toISOString().split("T")[0];

  const [form, setForm] = useState({
    // Auto-filled but editable
    poNumber:        `PO-${Date.now().toString().slice(-6)}`,
    poDate:          today,
    requestedBy:     "",
    department:      "Production",
    priority:        (item.current_stock ?? 0) < reorderLevel * 0.5 ? "Critical" : "High",
    status:          "Draft",

    // Item Details
    itemName:        item.name,
    itemCode:        `ITM-00${item.id}`,
    unit:            item.unit,
    currentStock:    item.current_stock ?? 0,
    reorderLevel:    reorderLevel,
    orderQty:        Math.max(reorderQty, 0),
    unitRate:        item.actual_rate ?? 0,
    gstPercent:      18,
    discount:        0,

    // Supplier
    supplierName:    supplier.name || "",
    supplierContact: supplier.contact || "",
    supplierAddress: "",
    alternateSupplier: "",

    // Delivery
    requiredByDate:  orderByStr,
    expectedDelivery: deliveryStr,
    deliveryAddress: "Factory Gate, Main Production Unit",
    deliveryTerms:   "Ex-Works",

    // Payment
    paymentTerms:    "Net 30",
    advancePercent:  0,
    bankDetails:     "",

    // Notes
    remarks:         "",
    qualityNotes:    "Ensure material passes QC inspection before acceptance.",
    specialInstructions: "",

    // Approval
    approvedBy:      "",
    approvalDate:    "",
  });

  const [activeSection, setActiveSection] = useState("basic");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const subtotal = form.orderQty * form.unitRate;
  const discountAmt = (subtotal * form.discount) / 100;
  const afterDiscount = subtotal - discountAmt;
  const gstAmt = (afterDiscount * form.gstPercent) / 100;
  const total = afterDiscount + gstAmt;

  const validate = () => {
    const e = {};
    if (!form.requestedBy.trim()) e.requestedBy = "Required";
    if (!form.supplierName.trim()) e.supplierName = "Required";
    if (form.orderQty <= 0) e.orderQty = "Must be greater than 0";
    if (form.unitRate <= 0) e.unitRate = "Must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (statusOverride) => {
    if (!validate()) return;
    const finalForm = { ...form, status: statusOverride || form.status, totalAmount: total };
    setSubmitted(true);
    setTimeout(() => {
      onSubmit && onSubmit(finalForm);
    }, 1800);
  };

  const sections = [
    { id: "basic",    label: "Basic Info",   icon: "◎" },
    { id: "item",     label: "Item Details", icon: "◈" },
    { id: "supplier", label: "Supplier",     icon: "◆" },
    { id: "delivery", label: "Delivery",     icon: "⚑" },
    { id: "payment",  label: "Payment",      icon: "₹" },
    { id: "notes",    label: "Notes",        icon: "✎" },
    { id: "summary",  label: "Summary",      icon: "✓" },
  ];

  if (submitted) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...modalStyle, maxWidth: 420, textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16, animation: "goldPulse 1s ease-in-out 3" }}>✓</div>
          <p style={{ fontFamily: "'Cinzel',serif", color: "#c9a84c", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Purchase Order Submitted
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 20 }}>
            {form.poNumber} has been saved and sent to the procurement team.
          </p>
          <div style={{ padding: "12px 20px", background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6 }}>
            <p style={{ color: "#c9a84c", fontFamily: "monospace", fontSize: 13 }}>Total: {formatINR(total)}</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4 }}>Status: {form.status}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>

        {/* Modal Header */}
        <div style={{
          padding: "20px 28px",
          borderBottom: "1px solid rgba(201,168,76,0.2)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "linear-gradient(135deg, #080d1c, #0d1526)",
          borderRadius: "10px 10px 0 0",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ color: "#c9a84c", fontSize: 24 }}>♛</span>
            <div>
              <p style={{ fontFamily: "'Cinzel',serif", color: "#c9a84c", fontWeight: 700, fontSize: 14, letterSpacing: "0.15em" }}>
                PURCHASE ORDER — {item.name.toUpperCase()}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace", marginTop: 2 }}>
                {form.poNumber} · All fields editable · Backend-ready structure
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`badge ${
              form.status === "Approved" ? "badge-saving" :
              form.status === "Cancelled" ? "badge-loss" : "badge-gold"
            }`}>{form.status}</span>
            <button onClick={onClose} style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)", cursor: "pointer", borderRadius: 4,
              padding: "5px 12px", fontSize: 13, transition: "all 0.2s",
            }}>✕</button>
          </div>
        </div>

        {/* Section Tabs */}
        <div style={{
          display: "flex", overflowX: "auto",
          borderBottom: "1px solid rgba(201,168,76,0.15)",
          background: "#080d1c",
          flexShrink: 0,
        }}>
          {sections.map((s, i) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              padding: "11px 18px",
              fontSize: 9,
              fontFamily: "'Cinzel',serif",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: "none",
              borderBottom: `2px solid ${activeSection === s.id ? "#c9a84c" : "transparent"}`,
              borderRight: "1px solid rgba(201,168,76,0.08)",
              background: activeSection === s.id ? "rgba(201,168,76,0.06)" : "transparent",
              color: activeSection === s.id ? "#c9a84c" : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}>
              <span style={{ marginRight: 5 }}>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>

          {/* ── BASIC INFO ── */}
          {activeSection === "basic" && (
            <div>
              <p className="section-title">◎ Basic Information</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Field label="PO Number" required>
                  <input style={inputStyle} value={form.poNumber} onChange={e => set("poNumber", e.target.value)} />
                </Field>
                <Field label="PO Date" required>
                  <input type="date" style={inputStyle} value={form.poDate} onChange={e => set("poDate", e.target.value)} />
                </Field>
                <Field label="Requested By" required>
                  <input
                    style={{ ...inputStyle, borderColor: errors.requestedBy ? "#f87171" : "rgba(201,168,76,0.2)" }}
                    placeholder="Enter your name"
                    value={form.requestedBy}
                    onChange={e => set("requestedBy", e.target.value)}
                  />
                  {errors.requestedBy && <p style={{ color: "#f87171", fontSize: 10, marginTop: 3 }}>⚠ {errors.requestedBy}</p>}
                </Field>
                <Field label="Department">
                  <select style={selectStyle} value={form.department} onChange={e => set("department", e.target.value)}>
                    {["Production","Procurement","Warehouse","Quality","Finance","Management"].map(d => (
                      <option key={d} value={d} style={{ background: "#0d1526" }}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority">
                  <select style={selectStyle} value={form.priority} onChange={e => set("priority", e.target.value)}>
                    {PRIORITY_OPTIONS.map(p => (
                      <option key={p} value={p} style={{ background: "#0d1526" }}>{p}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select style={selectStyle} value={form.status} onChange={e => set("status", e.target.value)}>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} style={{ background: "#0d1526" }}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Approved By">
                  <input style={inputStyle} placeholder="Manager / HOD name" value={form.approvedBy} onChange={e => set("approvedBy", e.target.value)} />
                </Field>
                <Field label="Approval Date">
                  <input type="date" style={inputStyle} value={form.approvalDate} onChange={e => set("approvalDate", e.target.value)} />
                </Field>
              </div>

              {/* Auto-filled info cards */}
              <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  ["Current Stock", `${item.inventory.current} ${item.unit}`, item.inventory.current < reorderLevel ? "#f87171" : "#4ade80"],
                  ["Reorder Level", `${reorderLevel} ${item.unit}`, "#c9a84c"],
                  ["Coverage Days", `${coverageDays} days`, coverageDays <= 3 ? "#f87171" : "#c9a84c"],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ padding: "12px 14px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 6 }}>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</p>
                    <p style={{ fontSize: 16, fontFamily: "monospace", fontWeight: 700, color }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ITEM DETAILS ── */}
          {activeSection === "item" && (
            <div>
              <p className="section-title">◈ Item Details</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Field label="Item Name" required>
                  <input style={inputStyle} value={form.itemName} onChange={e => set("itemName", e.target.value)} />
                </Field>
                <Field label="Item Code">
                  <input style={inputStyle} value={form.itemCode} onChange={e => set("itemCode", e.target.value)} />
                </Field>
                <Field label="Unit of Measurement">
                  <input style={inputStyle} value={form.unit} onChange={e => set("unit", e.target.value)} />
                </Field>
                <Field label="Current Stock">
                  <input type="number" style={inputStyle} value={form.currentStock} onChange={e => set("currentStock", Number(e.target.value))} />
                </Field>
                <Field label="Reorder Level">
                  <input type="number" style={inputStyle} value={form.reorderLevel} onChange={e => set("reorderLevel", Number(e.target.value))} />
                </Field>
                <Field label="Order Quantity" required>
                  <input
                    type="number"
                    style={{ ...inputStyle, borderColor: errors.orderQty ? "#f87171" : "rgba(201,168,76,0.2)" }}
                    value={form.orderQty}
                    onChange={e => set("orderQty", Number(e.target.value))}
                  />
                  {errors.orderQty && <p style={{ color: "#f87171", fontSize: 10, marginTop: 3 }}>⚠ {errors.orderQty}</p>}
                </Field>
                <Field label="Unit Rate (₹)" required>
                  <input
                    type="number"
                    style={{ ...inputStyle, borderColor: errors.unitRate ? "#f87171" : "rgba(201,168,76,0.2)" }}
                    value={form.unitRate}
                    onChange={e => set("unitRate", Number(e.target.value))}
                  />
                  {errors.unitRate && <p style={{ color: "#f87171", fontSize: 10, marginTop: 3 }}>⚠ {errors.unitRate}</p>}
                </Field>
                <Field label="GST %">
                  <select style={selectStyle} value={form.gstPercent} onChange={e => set("gstPercent", Number(e.target.value))}>
                    {[0, 5, 12, 18, 28].map(g => (
                      <option key={g} value={g} style={{ background: "#0d1526" }}>{g}%</option>
                    ))}
                  </select>
                </Field>
                <Field label="Discount %">
                  <input type="number" min="0" max="100" style={inputStyle} value={form.discount} onChange={e => set("discount", Number(e.target.value))} />
                </Field>
              </div>

              {/* Live Cost Preview */}
              <div style={{ marginTop: 8, padding: "16px 20px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8 }}>
                <p style={{ fontSize: 10, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", marginBottom: 12, fontFamily: "'Cinzel',serif" }}>LIVE COST PREVIEW</p>
                {[
                  ["Subtotal", formatINR(subtotal)],
                  [`Discount (${form.discount}%)`, `- ${formatINR(discountAmt)}`],
                  [`GST (${form.gstPercent}%)`, `+ ${formatINR(gstAmt)}`],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{label}</span>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "#e2e8f0" }}>{val}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0" }}>
                  <span style={{ fontSize: 12, color: "#c9a84c", fontFamily: "'Cinzel',serif", letterSpacing: "0.1em" }}>TOTAL AMOUNT</span>
                  <span style={{ fontSize: 20, fontFamily: "monospace", fontWeight: 800, color: "#c9a84c" }}>{formatINR(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── SUPPLIER ── */}
          {activeSection === "supplier" && (
            <div>
              <p className="section-title">◆ Supplier Information</p>

              {/* Supplier Quick Select */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontFamily: "'Raleway',sans-serif" }}>
                  Quick select from registered suppliers:
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {suppliers.map(s => (
                    <button key={s.name} onClick={() => {
                      set("supplierName", s.name);
                      set("supplierContact", s.contact);
                    }} style={{
                      padding: "6px 14px",
                      border: `1px solid ${form.supplierName === s.name ? "#c9a84c" : "rgba(201,168,76,0.2)"}`,
                      background: form.supplierName === s.name ? "rgba(201,168,76,0.12)" : "transparent",
                      color: form.supplierName === s.name ? "#c9a84c" : "rgba(255,255,255,0.35)",
                      borderRadius: 4, cursor: "pointer", fontSize: 11,
                      fontFamily: "monospace", transition: "all 0.2s",
                    }}>
                      {s.name}
                      <span style={{ fontSize: 9, marginLeft: 6, opacity: 0.6 }}>{s.reliability}/10</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Field label="Supplier Name" required>
                  <input
                    style={{ ...inputStyle, borderColor: errors.supplierName ? "#f87171" : "rgba(201,168,76,0.2)" }}
                    placeholder="Enter supplier name"
                    value={form.supplierName}
                    onChange={e => set("supplierName", e.target.value)}
                  />
                  {errors.supplierName && <p style={{ color: "#f87171", fontSize: 10, marginTop: 3 }}>⚠ {errors.supplierName}</p>}
                </Field>
                <Field label="Contact Number">
                  <input style={inputStyle} placeholder="+91 XXXXX XXXXX" value={form.supplierContact} onChange={e => set("supplierContact", e.target.value)} />
                </Field>
                <Field label="Supplier Address">
                  <input style={inputStyle} placeholder="Full address" value={form.supplierAddress} onChange={e => set("supplierAddress", e.target.value)} />
                </Field>
                <Field label="Alternate Supplier">
                  <input style={inputStyle} placeholder="Backup supplier name" value={form.alternateSupplier} onChange={e => set("alternateSupplier", e.target.value)} />
                </Field>
              </div>

              {/* Supplier Scorecard */}
              {form.supplierName && (() => {
                const s = suppliers.find(sup => sup.name === form.supplierName);
                if (!s) return null;
                const grade = s.reliability >= 9 ? "A+" : s.reliability >= 8 ? "A" : s.reliability >= 7 ? "B+" : "B";
                const gradeColor = grade.startsWith("A") ? "#4ade80" : "#c9a84c";
                return (
                  <div style={{ marginTop: 8, padding: "14px 18px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 8 }}>
                    <p style={{ fontSize: 10, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", marginBottom: 12, fontFamily: "'Cinzel',serif" }}>SUPPLIER SCORECARD</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                      {[
                        ["Reliability", `${s.reliability}/10`, gradeColor],
                        ["Grade", grade, gradeColor],
                        ["Lead Time", `${s.promisedLead}d promised / ${s.actualLead}d actual`, s.actualLead > s.promisedLead ? "#f87171" : "#4ade80"],
                        ["Price Change", `${s.priceChange > 0 ? "+" : ""}${s.priceChange}%`, s.priceChange > 0 ? "#f87171" : "#4ade80"],
                      ].map(([label, val, color]) => (
                        <div key={label} style={{ textAlign: "center" }}>
                          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{label}</p>
                          <p style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── DELIVERY ── */}
          {activeSection === "delivery" && (
            <div>
              <p className="section-title">⚑ Delivery Details</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Field label="Required By Date">
                  <input type="date" style={inputStyle} value={form.requiredByDate} onChange={e => set("requiredByDate", e.target.value)} />
                </Field>
                <Field label="Expected Delivery Date">
                  <input type="date" style={inputStyle} value={form.expectedDelivery} onChange={e => set("expectedDelivery", e.target.value)} />
                </Field>
                <Field label="Delivery Address">
                  <input style={inputStyle} value={form.deliveryAddress} onChange={e => set("deliveryAddress", e.target.value)} />
                </Field>
                <Field label="Delivery Terms">
                  <select style={selectStyle} value={form.deliveryTerms} onChange={e => set("deliveryTerms", e.target.value)}>
                    {["Ex-Works","FOB","CIF","DDP","DAP","FCA"].map(t => (
                      <option key={t} value={t} style={{ background: "#0d1526" }}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Delivery Timeline Visual */}
              <div style={{ marginTop: 12, padding: "16px 20px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 8 }}>
                <p style={{ fontSize: 10, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", marginBottom: 16, fontFamily: "'Cinzel',serif" }}>DELIVERY TIMELINE</p>
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  {[
                    { label: "TODAY", date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), color: "#c9a84c" },
                    { label: "ORDER BY", date: form.requiredByDate ? new Date(form.requiredByDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—", color: "#f87171" },
                    { label: "DELIVERY", date: form.expectedDelivery ? new Date(form.expectedDelivery).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—", color: "#4ade80" },
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: step.color, margin: "0 auto 6px", boxShadow: `0 0 8px ${step.color}80` }} />
                        <p style={{ fontSize: 9, color: step.color, fontFamily: "monospace", letterSpacing: "0.1em" }}>{step.label}</p>
                        <p style={{ fontSize: 11, color: "#e2e8f0", fontFamily: "monospace", marginTop: 2 }}>{step.date}</p>
                      </div>
                      {i < 2 && <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(201,168,76,0.4), rgba(201,168,76,0.1))" }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PAYMENT ── */}
          {activeSection === "payment" && (
            <div>
              <p className="section-title">₹ Payment Terms</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Field label="Payment Terms">
                  <select style={selectStyle} value={form.paymentTerms} onChange={e => set("paymentTerms", e.target.value)}>
                    {PAYMENT_OPTIONS.map(p => (
                      <option key={p} value={p} style={{ background: "#0d1526" }}>{p}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Advance Payment %">
                  <input type="number" min="0" max="100" style={inputStyle} value={form.advancePercent} onChange={e => set("advancePercent", Number(e.target.value))} />
                </Field>
                <Field label="Bank / UPI Details">
                  <input style={inputStyle} placeholder="Account / UPI ID" value={form.bankDetails} onChange={e => set("bankDetails", e.target.value)} />
                </Field>
              </div>

              {/* Payment Summary */}
              <div style={{ marginTop: 8, padding: "16px 20px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8 }}>
                <p style={{ fontSize: 10, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", marginBottom: 12, fontFamily: "'Cinzel',serif" }}>PAYMENT BREAKDOWN</p>
                {[
                  ["Total Order Value", formatINR(total)],
                  [`Advance (${form.advancePercent}%)`, formatINR((total * form.advancePercent) / 100)],
                  ["Balance Due", formatINR(total - (total * form.advancePercent) / 100)],
                  ["Payment Terms", form.paymentTerms],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</span>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "#e2e8f0", fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NOTES ── */}
          {activeSection === "notes" && (
            <div>
              <p className="section-title">✎ Notes & Instructions</p>
              {[
                { label: "Remarks", key: "remarks", placeholder: "General remarks or comments..." },
                { label: "Quality Notes", key: "qualityNotes", placeholder: "Quality inspection requirements..." },
                { label: "Special Instructions", key: "specialInstructions", placeholder: "Packing, labeling, or handling instructions..." },
              ].map(({ label, key, placeholder }) => (
                <Field key={key} label={label}>
                  <textarea
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                  />
                </Field>
              ))}
            </div>
          )}

          {/* ── SUMMARY ── */}
          {activeSection === "summary" && (
            <div>
              <p className="section-title">✓ Order Summary & Review</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {[
                  { title: "Order Info", items: [["PO Number", form.poNumber], ["Date", form.poDate], ["Requested By", form.requestedBy || "—"], ["Department", form.department], ["Priority", form.priority], ["Status", form.status]] },
                  { title: "Item Details", items: [["Item", form.itemName], ["Code", form.itemCode], ["Quantity", `${form.orderQty} ${form.unit}`], ["Unit Rate", `₹${form.unitRate}`], ["GST", `${form.gstPercent}%`], ["Total", formatINR(total)]] },
                  { title: "Supplier", items: [["Name", form.supplierName || "—"], ["Contact", form.supplierContact || "—"], ["Delivery Terms", form.deliveryTerms], ["Payment", form.paymentTerms]] },
                  { title: "Schedule", items: [["Order By", form.requiredByDate || "—"], ["Delivery", form.expectedDelivery || "—"], ["Address", form.deliveryAddress], ["Advance", `${form.advancePercent}%`]] },
                ].map(section => (
                  <div key={section.title} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 6 }}>
                    <p style={{ fontSize: 9, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", fontFamily: "'Cinzel',serif", marginBottom: 10 }}>{section.title.toUpperCase()}</p>
                    {section.items.map(([label, val]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{label}</span>
                        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#e2e8f0" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Total highlight */}
              <div style={{ padding: "18px 24px", background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", fontFamily: "'Cinzel',serif" }}>TOTAL ORDER VALUE (INCL. GST)</p>
                  <p style={{ fontSize: 28, fontFamily: "monospace", fontWeight: 800, color: "#c9a84c", marginTop: 4 }}>{formatINR(total)}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${form.priority === "Critical" ? "badge-critical" : "badge-gold"}`}>{form.priority} Priority</span>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6, fontFamily: "monospace" }}>{form.poNumber}</p>
                </div>
              </div>

              {/* Validation errors */}
              {Object.keys(errors).length > 0 && (
                <div style={{ padding: "12px 16px", background: "rgba(139,26,26,0.15)", border: "1px solid rgba(139,26,26,0.4)", borderRadius: 6, marginBottom: 16 }}>
                  <p style={{ fontSize: 11, color: "#f87171", fontFamily: "monospace" }}>⚠ Please fix the following before submitting:</p>
                  {Object.entries(errors).map(([key, msg]) => (
                    <p key={key} style={{ fontSize: 10, color: "#f87171", marginTop: 4, fontFamily: "monospace" }}>· {key}: {msg}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: "16px 28px",
          borderTop: "1px solid rgba(201,168,76,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#080d1c",
          borderRadius: "0 0 10px 10px",
          flexShrink: 0,
          gap: 10,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Section navigation */}
            <button onClick={() => {
              const idx = sections.findIndex(s => s.id === activeSection);
              if (idx > 0) setActiveSection(sections[idx - 1].id);
            }} style={{ ...ghostBtn, opacity: sections.findIndex(s => s.id === activeSection) === 0 ? 0.3 : 1 }}>
              ← Prev
            </button>
            <button onClick={() => {
              const idx = sections.findIndex(s => s.id === activeSection);
              if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
            }} style={{ ...ghostBtn, opacity: sections.findIndex(s => s.id === activeSection) === sections.length - 1 ? 0.3 : 1 }}>
              Next →
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handleSubmit("Draft")} style={ghostBtn}>Save Draft</button>
            <button onClick={() => handleSubmit("Pending Approval")} style={secondaryBtn}>Submit for Approval</button>
            <button onClick={() => handleSubmit("Approved")} style={primaryBtn}>✓ Approve & Order</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.88)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, backdropFilter: "blur(6px)", padding: "20px",
};

const modalStyle = {
  background: "#0d1526",
  border: "1px solid rgba(201,168,76,0.35)",
  borderRadius: 10,
  width: "min(820px, 100%)",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 0 80px rgba(0,0,0,0.9), 0 0 40px rgba(201,168,76,0.08)",
  animation: "fadeIn 0.3s ease",
};

const primaryBtn = {
  padding: "9px 20px",
  background: "rgba(201,168,76,0.18)",
  border: "1px solid rgba(201,168,76,0.5)",
  color: "#c9a84c",
  borderRadius: 5,
  cursor: "pointer",
  fontSize: 10,
  fontFamily: "'Cinzel',serif",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
};

const secondaryBtn = {
  ...primaryBtn,
  background: "rgba(201,168,76,0.07)",
  border: "1px solid rgba(201,168,76,0.25)",
};

const ghostBtn = {
  ...primaryBtn,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.4)",
};