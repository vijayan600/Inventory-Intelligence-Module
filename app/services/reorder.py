import math
from datetime import datetime, timedelta


def calc_reorder(item: dict) -> dict:
    daily = item["daily_consumption"]
    lead = item["lead_time_days"]
    safety = item["safety_stock"]
    current = item["current_stock"]

    reorder_level = daily * lead + safety
    reorder_qty = reorder_level - current
    coverage_days = round(current / daily, 1) if daily > 0 else 999

    now = datetime.now()
    stockout_date = now + timedelta(days=int(coverage_days))
    order_by_date = now + timedelta(days=max(0, int(coverage_days) - lead))
    delivery_date = now + timedelta(days=max(0, int(coverage_days) - lead) + lead)

    return {
        "reorder_level": reorder_level,
        "reorder_qty": reorder_qty,
        "coverage_days": coverage_days,
        "stockout_date": stockout_date.isoformat(),
        "order_by_date": order_by_date.isoformat(),
        "delivery_date": delivery_date.isoformat(),
    }


def calc_risk_score(item: dict) -> int:
    reorder_data = calc_reorder(item)
    reorder_level = reorder_data["reorder_level"]

    planned_amt = item["planned_qty"] * item["planned_rate"]
    actual_amt = item["actual_qty"] * item["actual_rate"]
    variance = actual_amt - planned_amt

    stock_ratio = item["current_stock"] / reorder_level if reorder_level > 0 else 1
    stock_risk = (1 - stock_ratio) * 40 if stock_ratio < 1 else 0
    lead_risk = (item["lead_time_days"] / 7) * 20
    variance_risk = min((variance / planned_amt) * 100, 20) if variance > 0 and planned_amt > 0 else 0
    delay_risk = min(item["delay_history"] * 4, 20)

    score = min(round(stock_risk + lead_risk + variance_risk + delay_risk), 100)
    return score


def calc_production_loss(item: dict) -> dict:
    reorder_data = calc_reorder(item)
    coverage_days = reorder_data["coverage_days"]
    hours_until_stop = coverage_days * 8
    loss_per_hour = item["production_value"]
    loss_per_day = item["production_value"] * 8
    worker_idle_cost = item["worker_cost"]
    total_loss = loss_per_day + worker_idle_cost

    return {
        "hours_until_stop": round(hours_until_stop, 1),
        "loss_per_hour": loss_per_hour,
        "loss_per_day": loss_per_day,
        "worker_idle_cost": worker_idle_cost,
        "total_loss": total_loss,
        "coverage_days": coverage_days,
    }


def build_reorder_alerts(items: list) -> list:
    alerts = []
    for item in items:
        reorder = calc_reorder(item)
        risk = calc_risk_score(item)
        alerts.append({
            "id": item["id"],
            "name": item["name"],
            "unit": item["unit"],
            "current_stock": item["current_stock"],
            "daily_usage": item["daily_consumption"],
            "lead_time": item["lead_time_days"],
            "safety_stock": item["safety_stock"],
            "reorder_level": reorder["reorder_level"],
            "suggested_reorder_qty": reorder["reorder_qty"],
            "coverage_days": reorder["coverage_days"],
            "risk_score": risk,
            "supplier_name": item["supplier_name"],
            "production_value": item["production_value"],
            "worker_cost": item["worker_cost"],
            "delay_history": item["delay_history"],
            "planned_qty": item["planned_qty"],
            "planned_rate": item["planned_rate"],
            "actual_qty": item["actual_qty"],
            "actual_rate": item["actual_rate"],
            "stockout_date": reorder["stockout_date"],
            "order_by_date": reorder["order_by_date"],
            "delivery_date": reorder["delivery_date"],
        })
    return alerts


def simulate_reorder(item: dict, consumption_increase: float, lead_time_increase: int, rate_increase: float) -> dict:
    original_daily = item["daily_consumption"]
    sim_daily = original_daily * (1 + consumption_increase / 100)
    sim_lead = item["lead_time_days"] + lead_time_increase
    sim_rate = item["actual_rate"] * (1 + rate_increase / 100)

    orig_reorder = calc_reorder(item)

    sim_reorder_level = round(sim_daily * sim_lead + item["safety_stock"])
    sim_reorder_qty = sim_reorder_level - item["current_stock"]
    sim_coverage_days = round(item["current_stock"] / sim_daily, 1) if sim_daily > 0 else 999
    sim_cost = item["actual_qty"] * sim_rate
    orig_cost = item["actual_qty"] * item["actual_rate"]
    cost_impact = sim_cost - orig_cost

    return {
        "item_name": item["name"],
        "original_daily": original_daily,
        "simulated_daily": round(sim_daily, 1),
        "original_lead": item["lead_time_days"],
        "simulated_lead": sim_lead,
        "original_rate": item["actual_rate"],
        "simulated_rate": round(sim_rate, 2),
        "original_reorder_level": orig_reorder["reorder_level"],
        "simulated_reorder_level": sim_reorder_level,
        "original_reorder_qty": orig_reorder["reorder_qty"],
        "simulated_reorder_qty": sim_reorder_qty,
        "original_coverage_days": orig_reorder["coverage_days"],
        "simulated_coverage_days": sim_coverage_days,
        "original_cost": orig_cost,
        "simulated_cost": round(sim_cost, 2),
        "cost_impact": round(cost_impact, 2),
        "status": "REORDER REQUIRED" if sim_reorder_qty > 0 else "STABLE",
    }
