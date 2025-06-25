import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import Form from "./Form";
import LogoutButton from "./LogoutButton";
import exifr from "exifr";

export default function RangerDashboard() {
  const [activeTab, setActiveTab] = useState("myreports");
  const [assignedReports, setAssignedReports] = useState([]);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [editCondition, setEditCondition] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch assigned and submitted reports
  useEffect(() => {
    async function fetchReports() {
      if (!user?.id) return;
      // Assigned to this ranger (assigned_to matches this user's id)
      const { data: assigned } = await supabase
        .from("ranger_reports")
        .select("*")
        .eq("assigned_to", user.id);

      // Reports submitted by this ranger (ranger_id matches this user's id)
      const { data: submitted } = await supabase
        .from("ranger_reports")
        .select("*")
        .eq("ranger_id", user.id);

      setAssignedReports(assigned || []);
      setSubmittedReports(submitted || []);
    }
    fetchReports();
  }, [refresh, user?.id]);

  // --- Edit handlers ---
  const openEdit = (report, e) => {
    e.stopPropagation();
    setSelectedReport(report);
    setEditNotes(report.notes || "");
    setEditCondition(report.condition || "");
  };

  const handleSave = async () => {
    if (!selectedReport) return;
    await supabase
      .from("ranger_reports")
      .update({ notes: editNotes, condition: editCondition })
      .eq("id", selectedReport.id);
    setSelectedReport(null);
    setRefresh((r) => !r);
  };

  // --- Status handler ---
  const handleStatusUpdate = async (report, newStatus, e) => {
    e.stopPropagation();
    setStatusUpdating(true);
    await supabase
      .from("ranger_reports")
      .update({ status: newStatus })
      .eq("id", report.id);
    setStatusUpdating(false);
    setSelectedReport(null);
    setRefresh((r) => !r);
  };

  // --- Image handler ---
  const handleImageChange = async (e, report) => {
    e.stopPropagation();
    setImageUploading(true);
    const file = e.target.files[0];
    const gps = await exifr.gps(file);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("reportId", report.id);
    const res = await fetch("http://localhost:5050/api/report/image", {
      method: "POST",
      body: formData,
    });
    const { imageUrl } = await res.json();
    await supabase
      .from("ranger_reports")
      .update({
        image_url: imageUrl,
        latitude: gps?.latitude || "",
        longitude: gps?.longitude || "",
      })
      .eq("id", report.id);
    setImageUploading(false);
    setRefresh((r) => !r);
  };

  // --- Table renderer ---
  const ReportsTable = ({ reports, type }) => (
    <div className="border rounded shadow bg-white mb-6 overflow-x-auto">
      <table className="w-full text-xs md:text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Condition</th>
            <th className="p-2">Notes</th>
            <th className="p-2">Assigned To</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-gray-400 py-4">
                No reports found.
              </td>
            </tr>
          )}
          {reports.map((r) => (
            <tr
              key={r.id}
              className="hover:bg-blue-50 cursor-pointer"
              onClick={() => setDetailModal(r)}
            >
              <td className="p-2">{r.condition}</td>
              <td className="p-2">{r.notes?.slice(0, 40)}</td>
              <td className="p-2">{r.assigned_to || "-"}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2 flex gap-2">
                <button
                  className="bg-blue-100 px-2 py-1 rounded text-xs"
                  onClick={(e) => openEdit(r, e)}
                >
                  Edit
                </button>
                {type === "assigned" && (
                  <>
                    <button
                      className="bg-green-200 px-2 py-1 rounded text-xs"
                      disabled={statusUpdating}
                      onClick={(e) => handleStatusUpdate(r, "resolved", e)}
                    >
                      Mark Resolved
                    </button>
                    <label className="bg-yellow-100 px-2 py-1 rounded text-xs cursor-pointer">
                      {imageUploading ? "Uploading..." : "Replace Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, r)}
                        disabled={imageUploading}
                      />
                    </label>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- Report details modal ---
  const ReportDetailModal = ({ report, onClose }) => {
    if (!report) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-30">
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-lg w-full relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-3 text-2xl font-bold text-gray-600 hover:text-blue-700"
          >
            &times;
          </button>
          <h3 className="text-xl font-bold mb-2 text-blue-800">
            Report Details
          </h3>
          <div className="mb-2">
            <strong>Status:</strong> {report.status}
          </div>
          <div className="mb-2">
            <strong>Condition:</strong> {report.condition}
          </div>
          <div className="mb-2">
            <strong>Notes:</strong>
            <div className="bg-gray-100 p-2 rounded mt-1 text-sm">
              {report.notes || "None"}
            </div>
          </div>
          <div className="mb-2">
            <strong>Assigned To:</strong> {report.assigned_to || "-"}
          </div>
          <div className="mb-2">
            <strong>Ranger Name:</strong> {report.ranger_name || "-"}
          </div>
          <div className="mb-2">
            <strong>Ranger ID:</strong> {report.ranger_id}
          </div>
          <div className="mb-2 flex flex-col">
            <strong>Location:</strong>
            <div className="flex items-center gap-2">
              <span>
                {report.latitude && report.longitude
                  ? `${report.latitude}, ${report.longitude}`
                  : "Not available"}
              </span>
              {report.latitude && report.longitude && (
                <a
                  href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold hover:bg-blue-200"
                >
                  View on Map
                </a>
              )}
            </div>
          </div>
          <div className="mb-2">
            <strong>Image:</strong>
            <div className="mt-1">
              {report.image_url ? (
                <img
                  src={report.image_url}
                  alt="Report"
                  className="max-h-40 max-w-full rounded shadow"
                />
              ) : (
                <span className="text-gray-500">No image</span>
              )}
            </div>
          </div>
          <div className="mb-2">
            <strong>Created At:</strong>{" "}
            {report.created_at
              ? new Date(report.created_at).toLocaleString()
              : "-"}
          </div>
          <div className="mb-2">
            <strong>Admin Notes:</strong>{" "}
            <span className="bg-gray-100 p-1 rounded">
              {report["Admin Notes"] || "-"}
            </span>
          </div>
          <div className="mb-2">
            <strong>Report ID:</strong> {report.id}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold">🧑‍✈️ Ranger Dashboard</h2>
        <LogoutButton />
      </div>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === "myreports" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("myreports")}
        >
          My Reports
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === "form" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("form")}
        >
          Submit Report
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "myreports" && (
        <div className="flex flex-col md:flex-row gap-8 max-w-3xl mx-auto">
          {/* Assigned to me */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2 text-green-700">
              Reports Assigned to Me
            </h3>
            <ReportsTable reports={assignedReports} type="assigned" />
          </div>
          {/* Reports I Submitted */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2 text-blue-700">
              Reports I Submitted
            </h3>
            <ReportsTable reports={submittedReports} type="submitted" />
          </div>
        </div>
      )}
      {activeTab === "form" && (
        <div className="max-w-2xl mx-auto">
          <Form />
        </div>
      )}

      {/* Details Modal */}
      {detailModal && (
        <ReportDetailModal
          report={detailModal}
          onClose={() => setDetailModal(null)}
        />
      )}

      {/* Edit Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Edit Report</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs">Notes:</label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs">Condition:</label>
                <select
                  className="w-full border p-2 rounded"
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value)}
                >
                  <option>Good</option>
                  <option>Moderate</option>
                  <option>Bad</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="bg-gray-200 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
