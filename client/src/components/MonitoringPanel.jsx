import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function MonitoringPanel() {
  const [reports, setReports] = useState([]);
  const [rangers, setRangers] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedRangerId, setSelectedRangerId] = useState("");

  const fetchData = async () => {
    const { data: reportData, error: reportError } = await supabase
      .from("ranger_reports")
      .select("*")
      .ilike("status", "monitoring");

    const { data: rangerData, error: rangerError } = await supabase
      .from("rangers")
      .select("id, name");

    if (reportError) console.error("❌ Error loading reports:", reportError);
    if (rangerError) console.error("❌ Error loading rangers:", rangerError);

    setReports(reportData || []);
    setRangers(rangerData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const assignRanger = async (reportId, rangerId) => {
    const { error } = await supabase
      .from("ranger_reports")
      .update({ assigned_to: rangerId })
      .eq("id", reportId);

    if (!error) {
      console.log("✅ Ranger assigned:", rangerId);
      fetchData();
      setSelectedReport((prev) => ({ ...prev, assigned_to: rangerId }));
    } else {
      console.error("❌ Failed to assign ranger:", error);
    }
  };

  const resolveTask = async (reportId) => {
    const { error } = await supabase
      .from("ranger_reports")
      .update({ status: "resolved" })
      .eq("id", reportId);

    if (!error) {
      setSelectedReport(null);
      fetchData();
    } else {
      console.error("❌ Failed to mark as resolved:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Monitoring Tasks</h2>

      <div className="overflow-x-auto border rounded">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Ranger Name</th>
              <th className="px-4 py-2">Condition</th>
              <th className="px-4 py-2">Assigned To</th>
              <th className="px-4 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedReport(r);
                  setSelectedRangerId(r.assigned_to || "");
                }}
              >
                <td className="px-4 py-2">{r.ranger_name}</td>
                <td className="px-4 py-2">{r.condition}</td>
                <td className="px-4 py-2">{r.assigned_to || "Unassigned"}</td>
                <td className="px-4 py-2">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-2">Task Details</h3>

            <p>
              <strong>Ranger:</strong> {selectedReport.ranger_name}
            </p>
            <p>
              <strong>Condition:</strong> {selectedReport.condition}
            </p>
            <p>
              <strong>Notes:</strong> {selectedReport.notes}
            </p>
            <p>
              <strong>Status:</strong> {selectedReport.status}
            </p>
            <p>
              <strong>Assigned To:</strong>{" "}
              {selectedReport.assigned_to || "Unassigned"}
            </p>

            {selectedReport.image_url && (
              <img
                src={selectedReport.image_url}
                alt="Report"
                className="my-3 w-full h-48 object-cover rounded border"
              />
            )}

            <div className="mb-4">
              <label className="block font-medium mb-1">Assign Ranger</label>
              <select
                value={selectedRangerId}
                onChange={(e) => setSelectedRangerId(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="">Unassigned</option>
                {rangers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} - {r.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() =>
                  assignRanger(selectedReport.id, selectedRangerId)
                }
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              >
                🔄 Update Assignment
              </button>
            </div>

            <button
              onClick={() => resolveTask(selectedReport.id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              ✅ Mark as Resolved
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
