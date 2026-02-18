from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "inventory_intelligence")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
items_col = db["inventory_items"]
orders_col = db["orders"]
suppliers_col = db["suppliers"]
production_plans_col = db["production_plans"]
actual_consumptions_col = db["actual_consumptions"]
supplier_performance_col = db["supplier_performance"]
purchase_orders_col = db["purchase_orders"]
