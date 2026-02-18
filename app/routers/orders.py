from fastapi import APIRouter
import crud
from schemas import OrderCreate

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("")
async def list_orders():
    return await crud.get_all_orders()


@router.get("/{order_id}")
async def get_order(order_id: int):
    return await crud.get_order_by_id(order_id)


@router.get("/{order_id}/summary")
async def order_summary(order_id: int):
    order = await crud.get_order_by_id(order_id)
    if not order:
        return {"error": "Order not found"}
    return {
        "order_code": order["order_code"],
        "planned_total": order["planned_total"],
        "actual_total": order["actual_total"],
        "variance_total": order["variance_total"],
        "status": order["status"],
    }


@router.post("")
async def create_order(order: OrderCreate):
    return await crud.create_order(order.model_dump())
