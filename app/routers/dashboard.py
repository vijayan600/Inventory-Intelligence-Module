from fastapi import APIRouter
import crud
from services.variance import calc_variance
from services.reorder import calc_reorder, calc_risk_score

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
async def get_overview():
    items = await crud.get_all_items()
    orders = await crud.get_all_orders()

    total_planned = sum(i["planned_qty"] * i["planned_rate"] for i in items)
    total_actual = sum(i["actual_qty"] * i["actual_rate"] for i in items)
    net_variance = total_actual - total_planned

    items_at_risk = sum(1 for i in items if calc_reorder(i)["reorder_qty"] > 0)
    avg_risk = round(sum(calc_risk_score(i) for i in items) / len(items)) if items else 0

    return {
        "planned_cost": total_planned,
        "actual_cost": total_actual,
        "net_variance": net_variance,
        "items_at_risk": items_at_risk,
        "avg_risk_score": avg_risk,
        "active_orders": len(orders),
    }
