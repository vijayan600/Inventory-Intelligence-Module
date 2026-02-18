from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from seed import seed_database

from routers import dashboard, items, variance, reorder, orders, suppliers, purchase_orders, simulation


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed database
    await seed_database()
    yield
    # Shutdown: nothing needed


app = FastAPI(
    title="Inventory Intelligence API",
    description="Backend for Inventory Reorder Prediction + Cost Variance Analysis System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(items.router)
app.include_router(variance.router)
app.include_router(reorder.router)
app.include_router(orders.router)
app.include_router(suppliers.router)
app.include_router(purchase_orders.router)
app.include_router(simulation.router)


@app.get("/")
async def root():
    return {"message": "Inventory Intelligence API is running", "docs": "/docs"}
