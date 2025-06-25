import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function ReportTable() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("ranger_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
    } else {
      setReports(data);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setLoading(true);
    const { error } = await supabase
      .from("ranger_reports")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) console.error("Status update failed:", error);
    await fetchReports();
    setSelectedReport(null);
    setLoading(false);
  };

  const handleAdminNotesSave = async () => {
    if (!selectedReport) return;
    setLoading(true);

    const { error } = await supabase
      .from("ranger_reports")
      .update({ "Admin Notes": adminNotes })
      .eq("id", selectedReport.id);

    if (error) console.error("Admin notes update failed:", error);
    await fetchReports();
    setSelectedReport(null);
    setLoading(false);
  };

  const handleDelete = async (report) => {
    setLoading(true);

    const publicId = report.image_url?.split("/").pop().split(".")[0];
    try {
      await fetch(`/api/delete-image?public_id=${publicId}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Failed to delete from Cloudinary", e);
    }

    const { error } = await supabase
      .from("ranger_reports")
      .delete()
      .eq("id", report.id);

    if (error) console.error("Delete from Supabase failed:", error);

    await fetchReports();
    setSelectedReport(null);
    setLoading(false);
  };

  const getStatusStyle = (status) => {
    switch ((status || "new").toLowerCase()) {
      case "new":
        return "text-yellow-600 font-semibold";
      case "monitoring":
        return "text-red-600 font-semibold";
      case "resolved":
        return "text-green-600 font-semibold";
      default:
        return "text-gray-700";
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filter === "All") return true;
    return report.condition?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Submitted Reports</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="All">All</option>
          <option value="Good">Good</option>
          <option value="Moderate">Moderate</option>
          <option value="Bad">Bad</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Ranger Name</th>
              <th className="border px-4 py-2">Ranger ID</th>
              <th className="border px-4 py-2">Condition</th>
              <th className="border px-4 py-2">Latitude</th>
              <th className="border px-4 py-2">Longitude</th>
              <th className="border px-4 py-2">Timestamp</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr
                key={report.id}
                onClick={() => {
                  setSelectedReport(report);
                  setAdminNotes(report["Admin Notes"] || "");
                }}
                className="cursor-pointer hover:bg-gray-100"
              >
                <td className="border px-4 py-2">{report.ranger_name}</td>
                <td className="border px-4 py-2">{report.ranger_id}</td>
                <td className="border px-4 py-2 capitalize">
                  {report.condition}
                </td>
                <td className="border px-4 py-2">{report.latitude}</td>
                <td className="border px-4 py-2">{report.longitude}</td>
                <td className="border px-4 py-2">
                  {new Date(report.created_at).toLocaleString()}
                </td>
                <td
                  className={`border px-4 py-2 ${getStatusStyle(
                    report.status
                  )}`}
                >
                  {report.status || "New"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4">Report Details</h3>

            {selectedReport.image_url && (
              <img
                src={selectedReport.image_url}
                alt="Report"
                className="w-full h-64 object-cover rounded mb-4"
              />
            )}

            <div className="space-y-1 mb-4 text-sm">
              <p>
                <strong>Ranger Name:</strong> {selectedReport.ranger_name}
              </p>
              <p>
                <strong>Ranger ID:</strong> {selectedReport.ranger_id}
              </p>
              <p>
                <strong>Condition:</strong> {selectedReport.condition}
              </p>
              <p>
                <strong>Latitude:</strong> {selectedReport.latitude}
              </p>
              <p>
                <strong>Longitude:</strong> {selectedReport.longitude}
              </p>
              <p>
                <strong>Status:</strong> {selectedReport.status || "New"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedReport.created_at).toLocaleString()}
              </p>
            </div>

            <div className="mb-4">
              <label className="block font-medium text-sm mb-1">
                Change Status:
              </label>
              <select
                value={selectedReport.status || "New"}
                onChange={(e) =>
                  handleStatusChange(selectedReport.id, e.target.value)
                }
                className="w-full border rounded px-2 py-1"
              >
                <option value="New">New</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-medium text-sm mb-1">
                Admin Notes:
              </label>
              <textarea
                className="w-full border rounded px-2 py-1"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <button
                onClick={handleAdminNotesSave}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Save Notes
              </button>
            </div>

            <button
              onClick={() => handleDelete(selectedReport)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
            >
              {loading ? "Deleting..." : "Delete Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
