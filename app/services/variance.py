import math


def calc_variance(item: dict) -> dict:
    planned_amt = item["planned_qty"] * item["planned_rate"]
    actual_amt = item["actual_qty"] * item["actual_rate"]
    variance = actual_amt - planned_amt
    price_variance = (item["actual_rate"] - item["planned_rate"]) * item["actual_qty"]
    qty_variance = (item["actual_qty"] - item["planned_qty"]) * item["planned_rate"]
    efficiency_pct = (item["planned_qty"] / item["actual_qty"]) * 100 if item["actual_qty"] > 0 else 100
    waste_pct = 100 - efficiency_pct
    status = "LOSS" if variance > 0 else "SAVING"

    return {
        "planned_amount": planned_amt,
        "actual_amount": actual_amt,
        "variance": variance,
        "price_variance": price_variance,
        "qty_variance": qty_variance,
        "efficiency_pct": round(efficiency_pct, 1),
        "waste_pct": round(waste_pct, 1),
        "status": status,
    }


def build_variance_report(items: list) -> list:
    report = []
    for item in items:
        v = calc_variance(item)
        report.append({
            "id": item["id"],
            "name": item["name"],
            "unit": item["unit"],
            "planned_qty": item["planned_qty"],
            "planned_rate": item["planned_rate"],
            "planned_amount": v["planned_amount"],
            "actual_qty": item["actual_qty"],
            "actual_rate": item["actual_rate"],
            "actual_amount": v["actual_amount"],
            "variance": v["variance"],
            "price_variance": v["price_variance"],
            "qty_variance": v["qty_variance"],
            "efficiency_pct": v["efficiency_pct"],
            "waste_pct": v["waste_pct"],
            "status": v["status"],
        })
    return report
