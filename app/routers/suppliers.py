from fastapi import APIRouter
import crud

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])


@router.get("")
async def list_suppliers():
    return await crud.get_all_suppliers()


@router.get("/performance")
async def supplier_performance():
    suppliers = await crud.get_all_suppliers()
    performance = []
    for s in suppliers:
        late = s["actual_lead_days"] > s["promised_lead_days"]
        grade = s.get("grade", "B")
        performance.append({
            "supplier_name": s["supplier_name"],
            "item": s["item"],
            "promised_lead_days": s["promised_lead_days"],
            "actual_lead_days": s["actual_lead_days"],
            "on_time": not late,
            "price_change_percent": s["price_change_percent"],
            "reliability_score": s["reliability_score"],
            "contact": s["contact"],
            "grade": grade,
        })
    return performance
