from database import items_col, orders_col, suppliers_col, purchase_orders_col
from datetime import datetime


# ── Helper: get next auto-increment id ──
async def get_next_id(collection):
    doc = await collection.find_one(sort=[("id", -1)])
    return (doc["id"] + 1) if doc else 1


 
#  INVENTORY ITEMS
 

async def get_all_items():
    cursor = items_col.find({}, {"_id": 0}).sort("id", 1)
    return await cursor.to_list(length=100)


async def get_item_by_id(item_id: int):
    return await items_col.find_one({"id": item_id}, {"_id": 0})


async def create_item(data: dict):
    data["id"] = await get_next_id(items_col)
    await items_col.insert_one(data)
    return await get_item_by_id(data["id"])


async def update_item(item_id: int, data: dict):
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return await get_item_by_id(item_id)
    await items_col.update_one({"id": item_id}, {"$set": update_data})
    return await get_item_by_id(item_id)


async def delete_item(item_id: int):
    result = await items_col.delete_one({"id": item_id})
    return result.deleted_count > 0


 
#  ORDERS
 

async def get_all_orders():
    cursor = orders_col.find({}, {"_id": 0}).sort("id", 1)
    return await cursor.to_list(length=100)


async def get_order_by_id(order_id: int):
    return await orders_col.find_one({"id": order_id}, {"_id": 0})


async def create_order(data: dict):
    data["id"] = await get_next_id(orders_col)
    variance = data["actual_total"] - data["planned_total"]
    data["variance_total"] = variance
    data["status"] = "Over Budget" if variance > 0 else "Under Budget"
    await orders_col.insert_one(data)
    return await get_order_by_id(data["id"])


 
#  SUPPLIERS
 

async def get_all_suppliers():
    cursor = suppliers_col.find({}, {"_id": 0}).sort("id", 1)
    return await cursor.to_list(length=100)


async def get_supplier_by_id(supplier_id: int):
    return await suppliers_col.find_one({"id": supplier_id}, {"_id": 0})


 
#  PURCHASE ORDERS
 

async def get_all_purchase_orders():
    cursor = purchase_orders_col.find({}, {"_id": 0}).sort("id", -1)
    return await cursor.to_list(length=100)


async def create_purchase_order(data: dict):
    data["id"] = await get_next_id(purchase_orders_col)
    data["created_at"] = datetime.now().isoformat()
    await purchase_orders_col.insert_one(data)
    return await purchase_orders_col.find_one({"id": data["id"]}, {"_id": 0})


async def update_purchase_order(po_number: str, data: dict):
    update_data = {k: v for k, v in data.items() if v is not None}
    await purchase_orders_col.update_one({"po_number": po_number}, {"$set": update_data})
    return await purchase_orders_col.find_one({"po_number": po_number}, {"_id": 0})
