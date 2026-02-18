# MongoDB doesn't use ORM models like SQLAlchemy.
# This file defines the document shapes as reference and for seed data creation.

# inventory_items document shape:
# {
#   "id": 1,
#   "name": "Fabric",
#   "unit": "kg",
#   "planned_qty": 100,
#   "planned_rate": 250,
#   "actual_qty": 110,
#   "actual_rate": 260,
#   "current_stock": 200,
#   "minimum_stock": 80,
#   "daily_consumption": 40,
#   "lead_time_days": 4,
#   "safety_stock": 80,
#   "supplier_name": "Rajesh Textiles",
#   "production_value": 4200,
#   "worker_cost": 1800,
#   "delay_history": 2
# }

# orders document shape:
# {
#   "id": 1,
#   "order_code": "ORD-2024-001",
#   "start_date": "15 Jan 2024",
#   "planned_total": 38000,
#   "actual_total": 41200,
#   "variance_total": 3200,
#   "status": "Over Budget"
# }

# suppliers document shape:
# {
#   "id": 1,
#   "supplier_name": "Rajesh Textiles",
#   "item": "Fabric",
#   "contact": "+91 98400 11111",
#   "promised_lead_days": 4,
#   "actual_lead_days": 5,
#   "price_change_percent": 4,
#   "reliability_score": 7.2,
#   "grade": "B+"
# }

# purchase_orders document shape:
# {
#   "po_number": "PO-123456",
#   "po_date": "2024-02-18",
#   "requested_by": "...",
#   "department": "Production",
#   "priority": "Critical",
#   "status": "Draft",
#   "item_name": "Fabric",
#   "item_code": "ITM-001",
#   "unit": "kg",
#   "current_stock": 200,
#   "reorder_level": 240,
#   "order_qty": 40,
#   "unit_rate": 260,
#   "gst_percent": 18,
#   "discount": 0,
#   "supplier_name": "...",
#   "supplier_contact": "...",
#   "total_amount": ...,
#   "created_at": "..."
# }
