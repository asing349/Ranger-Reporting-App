import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function ResolvedPanel() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState("resolved");

  useEffect(() => {
    fetchResolvedReports();
  }, []);

  const fetchResolvedReports = async () => {
    const { data, error } = await supabase
      .from("ranger_reports")
      .select("*")
      .ilike("status", "resolved");

    if (error) console.error("❌ Error fetching resolved reports:", error);
    else setReports(data || []);
  };

  const updateStatus = async (id) => {
    const { error } = await supabase
      .from("ranger_reports")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) console.error("❌ Failed to update status:", error);
    else {
      setSelectedReport(null);
      await fetchResolvedReports();
    }
  };

  const deleteReport = async (id) => {
    const { error } = await supabase
      .from("ranger_reports")
      .delete()
      .eq("id", id);

    if (error) console.error("❌ Failed to delete report:", error);
    else {
      setSelectedReport(null);
      await fetchResolvedReports();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Resolved Reports</h2>

      <div className="overflow-x-auto border rounded">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Ranger Name</th>
              <th className="px-4 py-2">Condition</th>
              <th className="px-4 py-2">Status</th>
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
                  setNewStatus("resolved");
                }}
              >
                <td className="px-4 py-2">{r.ranger_name}</td>
                <td className="px-4 py-2">{r.condition}</td>
                <td className="px-4 py-2 text-green-600 font-semibold">
                  Resolved
                </td>
                <td className="px-4 py-2">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-2">Report Details</h3>

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

            {selectedReport.image_url && (
              <img
                src={selectedReport.image_url}
                alt="Report"
                className="my-3 w-full h-48 object-cover rounded border"
              />
            )}

            <div className="mb-4">
              <label className="block font-medium mb-1">Change Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="resolved">Resolved</option>
                <option value="monitoring">Monitoring</option>
              </select>

              <button
                onClick={() => updateStatus(selectedReport.id)}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              >
                🔁 Update Status
              </button>
            </div>

            <button
              onClick={() => deleteReport(selectedReport.id)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
            >
              🗑️ Delete Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
