import { useState, useEffect } from "react";
import { formatINR } from "../data/staticData";
import { fetchVarianceReport } from "../api";

export default function VarianceTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchVarianceReport().then(setRows);
  }, []);

  let totP = 0, totA = 0, totV = 0;

  return (
    <div>
      <div className="card" style={{ marginBottom: 20, overflowX: "auto" }}>
        <p className="section-title">◆ Cost Variance Intelligence Report</p>

        <table>
          <thead>
            <tr>
              {["Item","Pl.Qty","Pl.Rate","Planned Amt","Ac.Qty","Ac.Rate","Actual Amt","Variance","Efficiency%","Status"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              totP += r.planned_amount; totA += r.actual_amount; totV += r.variance;
              const isLoss = r.variance > 0;
              return (
                <tr key={r.id} className={isLoss ? "loss-row" : "save-row"}>
                  <td style={{ color: "#c9a84c", fontWeight: 700, fontFamily: "'Cinzel',serif", fontSize: 12 }}>{r.name}</td>
                  <td>{r.planned_qty} {r.unit}</td>
                  <td>₹{r.planned_rate}</td>
                  <td style={{ color: "#e2e8f0" }}>{formatINR(r.planned_amount)}</td>
                  <td>{r.actual_qty} {r.unit}</td>
                  <td>₹{r.actual_rate}</td>
                  <td style={{ color: "#e2e8f0" }}>{formatINR(r.actual_amount)}</td>
                  <td style={{ color: isLoss ? "#f87171" : "#4ade80", fontWeight: 700 }}>
                    {isLoss ? "+" : ""}{formatINR(r.variance)}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: r.efficiency_pct >= 100 ? "#4ade80" : "#f87171" }}>
                        {r.efficiency_pct.toFixed(1)}%
                      </span>
                      <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                        <div style={{ width: `${Math.min(r.efficiency_pct, 100)}%`, height: 4, borderRadius: 99, background: r.efficiency_pct >= 100 ? "#4ade80" : "#f87171" }} />
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${isLoss ? "badge-loss" : "badge-saving"}`}>{r.status}</span></td>
                </tr>
              );
            })}
            <tr className="total-row">
              <td colSpan={3} style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 800, letterSpacing: "0.1em", fontSize: 11 }}>TOTAL</td>
              <td style={{ color: "#c9a84c", fontWeight: 800 }}>{formatINR(totP)}</td>
              <td colSpan={2} />
              <td style={{ color: "#c9a84c", fontWeight: 800 }}>{formatINR(totA)}</td>
              <td style={{ color: totV > 0 ? "#f87171" : "#4ade80", fontWeight: 800 }}>
                {totV > 0 ? "+" : ""}{formatINR(totV)}
              </td>
              <td colSpan={2}>
                <span className={`badge ${totV > 0 ? "badge-loss" : "badge-saving"}`}>
                  {totV > 0 ? "NET LOSS" : "NET SAVING"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Variance Drill-Down */}
      <div className="card">
        <p className="section-title">◈ Variance Drill-Down: Price vs Quantity Split</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Raleway',sans-serif" }}>
          Understand the root cause — is the loss from price increase or excess material usage?
        </p>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Total Variance</th>
                <th>Price Variance</th>
                <th>Qty Variance</th>
                <th>Root Cause</th>
                <th>Action Needed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isLoss = r.variance > 0;
                const priceIsBigger = Math.abs(r.price_variance) > Math.abs(r.qty_variance);
                const rootCause = priceIsBigger ? "Supplier Rate ↑" : "Material Waste ↑";
                const action = priceIsBigger ? "Renegotiate supplier price" : "Reduce floor wastage";
                return (
                  <tr key={r.id} className={isLoss ? "loss-row" : "save-row"}>
                    <td style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12 }}>{r.name}</td>
                    <td style={{ color: isLoss ? "#f87171" : "#4ade80", fontWeight: 700 }}>
                      {isLoss ? "+" : ""}{formatINR(r.variance)}
                    </td>
                    <td style={{ color: r.price_variance > 0 ? "#f87171" : "#4ade80" }}>
                      {r.price_variance > 0 ? "+" : ""}{formatINR(r.price_variance)}
                    </td>
                    <td style={{ color: r.qty_variance > 0 ? "#f87171" : "#4ade80" }}>
                      {r.qty_variance > 0 ? "+" : ""}{formatINR(r.qty_variance)}
                    </td>
                    <td>
                      <span className={`badge ${isLoss ? "badge-loss" : "badge-stable"}`}>{rootCause}</span>
                    </td>
                    <td style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'Raleway',sans-serif" }}>{action}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}