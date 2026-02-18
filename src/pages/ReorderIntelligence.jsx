import ReorderCards from "../components/ReorderCards";
import RiskScoreEngine from "../components/RiskScoreEngine";
import ScenarioSimulator from "../components/ScenarioSimulator";

export default function ReorderIntelligence() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="section-title">◆ Predictive Reorder Intelligence System</p>
        <ReorderCards />
      </div>
      <RiskScoreEngine />
      <ScenarioSimulator />
    </div>
  );
}