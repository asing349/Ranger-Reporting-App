import { useState } from "react";
import ReportTable from "./ReportTable";
import MapView from "./MapView";
import MonitoringPanel from "./MonitoringPanel";
import ResolvedPanel from "./ResolvedPanel";
import RangersPanel from "./RangersPanel";
import LogoutButton from "./LogoutButton"; // ✅ Add logout

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("reports");

  const renderTabContent = () => {
    switch (activeTab) {
      case "reports":
        return (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-[40%] border border-gray-300 rounded-md shadow-sm">
              <ReportTable type="all" />
            </div>
            <div className="w-full lg:w-[60%] border border-gray-300 rounded-md shadow-sm">
              <MapView />
            </div>
          </div>
        );
      case "monitoring":
        return (
          <div className="border border-gray-300 rounded-md shadow-sm">
            <MonitoringPanel />
          </div>
        );
      case "resolved":
        return (
          <div className="border border-gray-300 rounded-md shadow-sm">
            <ResolvedPanel />
          </div>
        );
      case "rangers":
        return (
          <div className="border border-gray-300 rounded-md shadow-sm">
            <RangersPanel />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      {/* Header with title and logout */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">🧭 Admin Dashboard</h2>
        <LogoutButton />
      </div>

      {/* Tab buttons */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "reports" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "monitoring"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("monitoring")}
        >
          Monitoring
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "resolved" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("resolved")}
        >
          Resolved
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "rangers" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("rangers")}
        >
          Rangers
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
}
