from fastapi import APIRouter
import crud
from services.variance import build_variance_report

router = APIRouter(prefix="/api/variance", tags=["Variance"])


@router.get("/report")
async def variance_report():
    items = await crud.get_all_items()
    return build_variance_report(items)
