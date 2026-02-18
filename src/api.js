const API_BASE = "/api";

// ── Transform flat backend item → nested frontend shape ──
function transformItem(b) {
  return {
    id: b.id,
    name: b.name,
    unit: b.unit,
    planned: { qty: b.planned_qty, rate: b.planned_rate },
    actual: { qty: b.actual_qty, rate: b.actual_rate },
    inventory: {
      current: b.current_stock,
      daily: b.daily_consumption,
      lead: b.lead_time_days,
      safety: b.safety_stock,
    },
    supplier: b.supplier_name,
    productionValue: b.production_value,
    workerCost: b.worker_cost,
    delayHistory: b.delay_history,
  };
}

// ── API Fetchers ──

export async function fetchItems() {
  const res = await fetch(`${API_BASE}/items`);
  const data = await res.json();
  return data.map(transformItem);
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  const data = await res.json();
  // Transform backend order → frontend order shape
  return data.map(b => ({
    id: b.order_code,
    date: b.start_date,
    planned: b.planned_total,
    actual: b.actual_total,
  }));
}

export async function fetchSuppliers() {
  const res = await fetch(`${API_BASE}/suppliers`);
  const data = await res.json();
  return data.map(b => ({
    name: b.supplier_name,
    item: b.item,
    promisedLead: b.promised_lead_days,
    actualLead: b.actual_lead_days,
    priceChange: b.price_change_percent,
    reliability: b.reliability_score,
    contact: b.contact,
  }));
}

export async function fetchDashboardOverview() {
  const res = await fetch(`${API_BASE}/dashboard/overview`);
  return res.json();
}

export async function fetchVarianceReport() {
  const res = await fetch(`${API_BASE}/variance/report`);
  return res.json();
}

export async function fetchReorderAlerts() {
  const res = await fetch(`${API_BASE}/reorder/alerts`);
  return res.json();
}

export async function createItem(item) {
  const res = await fetch(`${API_BASE}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function updateItem(id, data) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE}/items/${id}`, { method: "DELETE" });
  return res.json();
}

export async function createPurchaseOrder(po) {
  const res = await fetch(`${API_BASE}/purchase-orders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(po),
  });
  return res.json();
}

export async function runSimulation(params) {
  const res = await fetch(`${API_BASE}/simulation/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}
