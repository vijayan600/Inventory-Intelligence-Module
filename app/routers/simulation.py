from fastapi import APIRouter
import crud
from schemas import SimulationInput
from services.reorder import simulate_reorder

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])


@router.post("/reorder")
async def run_simulation(sim: SimulationInput):
    item = await crud.get_item_by_id(sim.item_id)
    if not item:
        return {"error": "Item not found"}
    return simulate_reorder(
        item,
        sim.consumption_increase,
        sim.lead_time_increase,
        sim.rate_increase,
    )
