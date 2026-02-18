import KPICards from "../components/KPICards";
import AlertsPanel from "../components/AlertsPanel";
import StockHealthMatrix from "../components/StockHealthMatrix";

export default function Overview() {
  return (
    <div>
      <KPICards />
      <div className="grid-2">
        <AlertsPanel />
        <StockHealthMatrix />
      </div>
    </div>
  );
}