import { useState } from "react";
import "./index.css";
import Header from "./components/Header";
import Ticker from "./components/Ticker";
import Overview from "./pages/Overview";
import VarianceAnalysis from "./pages/VarianceAnalysis";
import ReorderIntelligence from "./pages/ReorderIntelligence";
import OrderLedgerPage from "./pages/OrderLedgerPage";
import ItemManager from "./pages/ItemManager";

const tabs = [
  { id: "overview",  label: "Overview",              icon: "◎" },
  { id: "variance",  label: "Variance Analysis",     icon: "◈" },
  { id: "reorder",   label: "Reorder Intelligence",  icon: "⚑" },
  { id: "ledger",    label: "Order Ledger",           icon: "◆" },
  { id: "items",     label: "Item Management",        icon: "✎" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div style={{ backgroundColor: "#0a0f1e", minHeight: "100vh" }}>
      <Header />
      <Ticker />

      <div className="tab-bar">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ borderRight: i < tabs.length - 1 ? "1px solid rgba(201,168,76,0.12)" : "none" }}
          >
            <span style={{ marginRight: 6, opacity: 0.6 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "28px 32px" }}>
        {activeTab === "overview"  && <Overview />}
        {activeTab === "variance"  && <VarianceAnalysis />}
        {activeTab === "reorder"   && <ReorderIntelligence />}
        {activeTab === "ledger"    && <OrderLedgerPage />}
        {activeTab === "items"     && <ItemManager />}
      </div>
    </div>
  );
}