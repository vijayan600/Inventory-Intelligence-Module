import { items, calcVariance, calcReorder, calcRiskScore } from "../data/staticData";

export default function Ticker() {
  const parts = items.map((item) => {
    const { variance } = calcVariance(item);
    const { reorderQty, coverageDays } = calcReorder(item);
    const risk = calcRiskScore(item);
    const lossStr = variance > 0
      ? `▲ ₹${Math.abs(variance).toLocaleString("en-IN")} LOSS`
      : `▼ ₹${Math.abs(variance).toLocaleString("en-IN")} SAVING`;
    const stockStr = reorderQty > 0 ? `⚠ REORDER REQUIRED · ${coverageDays}d LEFT` : `✓ STABLE · ${coverageDays}d COVER`;
    return `${item.name.toUpperCase()} · ${lossStr} · ${stockStr} · RISK: ${risk}/100`;
  });

  const text = parts.join("     ◈     ");
  const doubled = text + "     ◈     " + text;

  return (
    <div className="marquee-wrapper">
      <div className="marquee-track">{doubled}</div>
    </div>
  );
}