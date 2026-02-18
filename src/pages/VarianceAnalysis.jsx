import VarianceTable from "../components/VarianceTable";
import WasteIndex from "../components/WasteIndex";

export default function VarianceAnalysis() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <VarianceTable />
      <WasteIndex />
    </div>
  );
}