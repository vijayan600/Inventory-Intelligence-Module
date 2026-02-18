from fastapi import APIRouter
import crud
from schemas import ItemCreate, ItemUpdate

router = APIRouter(prefix="/api/items", tags=["Items"])


@router.get("")
async def list_items():
    return await crud.get_all_items()


@router.get("/{item_id}")
async def get_item(item_id: int):
    return await crud.get_item_by_id(item_id)


@router.post("")
async def create_item(item: ItemCreate):
    return await crud.create_item(item.model_dump())


@router.put("/{item_id}")
async def update_item(item_id: int, item: ItemUpdate):
    return await crud.update_item(item_id, item.model_dump(exclude_unset=True))


@router.delete("/{item_id}")
async def delete_item(item_id: int):
    deleted = await crud.delete_item(item_id)
    return {"deleted": deleted}
