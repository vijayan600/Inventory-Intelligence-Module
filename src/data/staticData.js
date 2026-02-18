export const items = [
  {
    id: 1,
    name: "Fabric",
    unit: "kg",
    planned: { qty: 100, rate: 250 },
    actual: { qty: 110, rate: 260 },
    inventory: { current: 200, daily: 40, lead: 4, safety: 80 },
    supplier: "Rajesh Textiles",
    productionValue: 4200,
    workerCost: 1800,
    delayHistory: 2,
  },
  {
    id: 2,
    name: "Thread",
    unit: "cones",
    planned: { qty: 200, rate: 45 },
    actual: { qty: 190, rate: 48 },
    inventory: { current: 80, daily: 50, lead: 3, safety: 40 },
    supplier: "Kumar Yarns",
    productionValue: 2100,
    workerCost: 1800,
    delayHistory: 5,
  },
  {
    id: 3,
    name: "Buttons",
    unit: "pcs",
    planned: { qty: 500, rate: 2 },
    actual: { qty: 520, rate: 2.5 },
    inventory: { current: 300, daily: 100, lead: 2, safety: 150 },
    supplier: "Shiva Accessories",
    productionValue: 1500,
    workerCost: 1800,
    delayHistory: 1,
  },
  {
    id: 4,
    name: "Zipper",
    unit: "pcs",
    planned: { qty: 150, rate: 18 },
    actual: { qty: 140, rate: 17 },
    inventory: { current: 500, daily: 30, lead: 5, safety: 60 },
    supplier: "Metro Zippers",
    productionValue: 3200,
    workerCost: 1800,
    delayHistory: 0,
  },
  {
    id: 5,
    name: "Lining",
    unit: "meters",
    planned: { qty: 80, rate: 120 },
    actual: { qty: 90, rate: 125 },
    inventory: { current: 50, daily: 20, lead: 3, safety: 30 },
    supplier: "Decent Fabrics",
    productionValue: 3800,
    workerCost: 1800,
    delayHistory: 3,
  },
];

export const orders = [
  { id: "ORD-2024-001", date: "15 Jan 2024", planned: 38000, actual: 41200 },
  { id: "ORD-2024-002", date: "18 Jan 2024", planned: 27500, actual: 26800 },
  { id: "ORD-2024-003", date: "22 Jan 2024", planned: 45000, actual: 48750 },
  { id: "ORD-2024-004", date: "28 Jan 2024", planned: 52000, actual: 50100 },
  { id: "ORD-2024-005", date: "05 Feb 2024", planned: 31000, actual: 34200 },
];

export const suppliers = [
  { name: "Rajesh Textiles", item: "Fabric", promisedLead: 4, actualLead: 5, priceChange: 4, reliability: 7.2, contact: "+91 98400 11111" },
  { name: "Kumar Yarns", item: "Thread", promisedLead: 3, actualLead: 3, priceChange: 6.7, reliability: 8.9, contact: "+91 98400 22222" },
  { name: "Shiva Accessories", item: "Buttons", promisedLead: 2, actualLead: 2, priceChange: 25, reliability: 6.1, contact: "+91 98400 33333" },
  { name: "Metro Zippers", item: "Zipper", promisedLead: 5, actualLead: 4, priceChange: -5.6, reliability: 9.4, contact: "+91 98400 44444" },
  { name: "Decent Fabrics", item: "Lining", promisedLead: 3, actualLead: 4, priceChange: 4.2, reliability: 7.8, contact: "+91 98400 55555" },
];

export const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const calcVariance = (item) => {
  const plannedAmt = item.planned.qty * item.planned.rate;
  const actualAmt = item.actual.qty * item.actual.rate;
  const variance = actualAmt - plannedAmt;
  const priceVariance = (item.actual.rate - item.planned.rate) * item.actual.qty;
  const qtyVariance = (item.actual.qty - item.planned.qty) * item.planned.rate;
  const efficiencyPct = (item.planned.qty / item.actual.qty) * 100;
  const wastePct = 100 - efficiencyPct;
  return { plannedAmt, actualAmt, variance, priceVariance, qtyVariance, efficiencyPct, wastePct };
};

export const calcReorder = (item) => {
  const reorderLevel = item.inventory.daily * item.inventory.lead + item.inventory.safety;
  const reorderQty = reorderLevel - item.inventory.current;
  const coverageDays = parseFloat((item.inventory.current / item.inventory.daily).toFixed(1));
  const stockoutDate = new Date();
  stockoutDate.setDate(stockoutDate.getDate() + Math.floor(coverageDays));
  const orderByDate = new Date();
  orderByDate.setDate(orderByDate.getDate() + Math.max(0, Math.floor(coverageDays) - item.inventory.lead));
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + Math.max(0, Math.floor(coverageDays) - item.inventory.lead) + item.inventory.lead);
  return { reorderLevel, reorderQty, coverageDays, stockoutDate, orderByDate, deliveryDate };
};

export const calcRiskScore = (item) => {
  const { reorderLevel, coverageDays } = calcReorder(item);
  const { variance } = calcVariance(item);
  const stockRatio = item.inventory.current / reorderLevel;
  const stockRisk = stockRatio < 1 ? (1 - stockRatio) * 40 : 0;
  const leadRisk = (item.inventory.lead / 7) * 20;
  const varianceRisk = variance > 0 ? Math.min((variance / (item.planned.qty * item.planned.rate)) * 100, 20) : 0;
  const delayRisk = Math.min(item.delayHistory * 4, 20);
  const score = Math.min(Math.round(stockRisk + leadRisk + varianceRisk + delayRisk), 100);
  return score;
};

export const calcProductionLoss = (item) => {
  const { coverageDays } = calcReorder(item);
  const hoursUntilStop = coverageDays * 8;
  const lossPerHour = item.productionValue;
  const lossPerDay = item.productionValue * 8;
  const workerIdleCost = item.workerCost;
  const totalLoss = lossPerDay + workerIdleCost;
  return { hoursUntilStop, lossPerHour, lossPerDay, workerIdleCost, totalLoss, coverageDays };
};