from fastapi import APIRouter
import crud
from services.reorder import build_reorder_alerts

router = APIRouter(prefix="/api/reorder", tags=["Reorder"])


@router.get("/alerts")
async def reorder_alerts():
    items = await crud.get_all_items()
    return build_reorder_alerts(items)
