// Static arrays removed — data now fetched from MongoDB via API

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