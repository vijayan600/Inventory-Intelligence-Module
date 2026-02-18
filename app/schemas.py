from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Inventory Item ──
class ItemBase(BaseModel):
    name: str
    unit: str
    planned_qty: float
    planned_rate: float
    actual_qty: float
    actual_rate: float
    current_stock: float
    minimum_stock: float
    daily_consumption: float
    lead_time_days: int
    safety_stock: float
    supplier_name: str
    production_value: float
    worker_cost: float
    delay_history: int


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    planned_qty: Optional[float] = None
    planned_rate: Optional[float] = None
    actual_qty: Optional[float] = None
    actual_rate: Optional[float] = None
    current_stock: Optional[float] = None
    minimum_stock: Optional[float] = None
    daily_consumption: Optional[float] = None
    lead_time_days: Optional[int] = None
    safety_stock: Optional[float] = None
    supplier_name: Optional[str] = None
    production_value: Optional[float] = None
    worker_cost: Optional[float] = None
    delay_history: Optional[int] = None


class ItemOut(ItemBase):
    id: int


# ── Order ──
class OrderBase(BaseModel):
    order_code: str
    start_date: str
    planned_total: float
    actual_total: float


class OrderCreate(OrderBase):
    pass


class OrderOut(OrderBase):
    id: int
    variance_total: float
    status: str


# ── Supplier ──
class SupplierBase(BaseModel):
    supplier_name: str
    item: str
    contact: str
    promised_lead_days: int
    actual_lead_days: int
    price_change_percent: float
    reliability_score: float


class SupplierOut(SupplierBase):
    id: int
    grade: str


# ── Purchase Order ──
class PurchaseOrderCreate(BaseModel):
    po_number: str
    po_date: str
    requested_by: str
    department: str = "Production"
    priority: str = "High"
    status: str = "Draft"
    item_name: str
    item_code: str
    unit: str
    current_stock: float
    reorder_level: float
    order_qty: float
    unit_rate: float
    gst_percent: float = 18
    discount: float = 0
    supplier_name: str
    supplier_contact: str = ""
    supplier_address: str = ""
    alternate_supplier: str = ""
    required_by_date: str = ""
    expected_delivery: str = ""
    delivery_address: str = "Factory Gate, Main Production Unit"
    delivery_terms: str = "Ex-Works"
    payment_terms: str = "Net 30"
    advance_percent: float = 0
    bank_details: str = ""
    remarks: str = ""
    quality_notes: str = ""
    special_instructions: str = ""
    approved_by: str = ""
    approval_date: str = ""
    total_amount: float


class PurchaseOrderOut(PurchaseOrderCreate):
    id: int
    created_at: str


# ── Dashboard Overview ──
class DashboardOverview(BaseModel):
    planned_cost: float
    actual_cost: float
    net_variance: float
    items_at_risk: int
    avg_risk_score: int
    active_orders: int


# ── Variance Report Row ──
class VarianceRow(BaseModel):
    id: int
    name: str
    unit: str
    planned_qty: float
    planned_rate: float
    planned_amount: float
    actual_qty: float
    actual_rate: float
    actual_amount: float
    variance: float
    price_variance: float
    qty_variance: float
    efficiency_pct: float
    waste_pct: float
    status: str


# ── Reorder Alert ──
class ReorderAlert(BaseModel):
    id: int
    name: str
    unit: str
    current_stock: float
    daily_usage: float
    lead_time: int
    safety_stock: float
    reorder_level: float
    suggested_reorder_qty: float
    coverage_days: float
    risk_score: int
    supplier_name: str
    production_value: float
    worker_cost: float
    delay_history: int
    planned_qty: float
    planned_rate: float
    actual_qty: float
    actual_rate: float


# ── Simulation ──
class SimulationInput(BaseModel):
    item_id: int
    consumption_increase: float = 0
    lead_time_increase: int = 0
    rate_increase: float = 0


class SimulationResult(BaseModel):
    item_name: str
    original_daily: float
    simulated_daily: float
    original_lead: int
    simulated_lead: int
    original_rate: float
    simulated_rate: float
    original_reorder_level: float
    simulated_reorder_level: float
    original_reorder_qty: float
    simulated_reorder_qty: float
    original_coverage_days: float
    simulated_coverage_days: float
    original_cost: float
    simulated_cost: float
    cost_impact: float
    status: str
