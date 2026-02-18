from fastapi import APIRouter
import crud
from schemas import PurchaseOrderCreate
from database import items_col

router = APIRouter(prefix="/api/purchase-orders", tags=["Purchase Orders"])


@router.get("")
async def list_purchase_orders():
    return await crud.get_all_purchase_orders()


@router.post("/create")
async def create_purchase_order(po: PurchaseOrderCreate):
    result = await crud.create_purchase_order(po.model_dump())
    # Increase item stock by ordered quantity
    await items_col.update_one(
        {"name": po.item_name},
        {"$inc": {"current_stock": po.order_qty}},
    )
    return result


@router.put("/{po_number}")
async def update_purchase_order(po_number: str, data: dict):
    return await crud.update_purchase_order(po_number, data)
