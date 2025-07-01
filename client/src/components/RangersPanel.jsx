import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

function ConfirmModal({ open, onClose, onConfirm, action, ranger }) {
  if (!open || !ranger) return null;
  return (
    <div className="fixed z-50 left-0 top-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
        <h3 className="text-lg font-bold mb-2 text-center">
          {action === "approve" ? "Approve Ranger" : "Disable Ranger"}
        </h3>
        <p className="mb-4 text-center">
          Are you sure you want to <b>{action}</b> <br />
          <span className="font-semibold">Name:</span> {ranger.name} <br />
          <span className="font-semibold">Ranger ID:</span>{" "}
          {ranger.ranger_id || ranger.id}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white font-semibold ${
              action === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RangersPanel() {
  const [approved, setApproved] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(""); // "approve" or "disable"
  const [selectedRanger, setSelectedRanger] = useState(null);

  useEffect(() => {
    const fetchRangers = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: approvedData, error: err1 } = await supabase
          .from("rangers")
          .select("*");
        const { data: pendingData, error: err2 } = await supabase
          .from("pending_ranger_requests")
          .select("*");
        if (err1 || err2)
          throw new Error((err1?.message || "") + (err2?.message || ""));
        setApproved(approvedData || []);
        setPending(pendingData || []);
      } catch (err) {
        setError("Failed to load rangers: " + err.message);
      }
      setLoading(false);
    };

    fetchRangers();
  }, []);

  // Helper to trigger modal
  const openModal = (action, ranger) => {
    setModalAction(action);
    setSelectedRanger(ranger);
    setModalOpen(true);
  };

  // Confirm action
  const handleModalConfirm = async () => {
    setModalOpen(false);
    if (modalAction === "approve") {
      await handleApprove(selectedRanger);
    } else if (modalAction === "disable") {
      await handleDisable(selectedRanger);
    }
    setSelectedRanger(null);
    setModalAction("");
    window.location.reload(); // Force page reload for instant update
  };

  const handleApprove = async (pendingRanger) => {
    setError("");
    try {
      const { error: insertErr } = await supabase.from("rangers").insert([
        {
          id: pendingRanger.ranger_id,
          name: pendingRanger.name,
          email: pendingRanger.email,
          password: pendingRanger.password_hash,
          phone: "",
          status: "active",
        },
      ]);
      if (insertErr) throw insertErr;

      const { error: deleteErr } = await supabase
        .from("pending_ranger_requests")
        .delete()
        .eq("id", pendingRanger.id);
      if (deleteErr) throw deleteErr;

      // No need to update UI manually; reload will happen
      await sendNotificationEmail(pendingRanger.email, "enabled");
    } catch (err) {
      setError("Error approving ranger: " + err.message);
    }
  };

  const handleDisapprove = async (pendingRanger) => {
    setError("");
    try {
      const { error } = await supabase
        .from("pending_ranger_requests")
        .delete()
        .eq("id", pendingRanger.id);
      if (error) throw error;
      setPending((prev) => prev.filter((r) => r.id !== pendingRanger.id));
    } catch (err) {
      setError("Error removing pending ranger: " + err.message);
    }
  };

  const handleDisable = async (ranger) => {
    setError("");
    try {
      // 1. Unassign from reports
      const { error: reportErr } = await supabase
        .from("ranger_reports")
        .update({ assigned_to: null })
        .eq("assigned_to", ranger.id);
      if (reportErr) throw reportErr;

      // 2. Insert into pending_ranger_requests
      const { error: insertErr } = await supabase
        .from("pending_ranger_requests")
        .insert([
          {
            ranger_id: ranger.id,
            name: ranger.name,
            email: ranger.email,
            password_hash: ranger.password,
          },
        ]);
      if (insertErr) throw insertErr;

      // 3. Delete from rangers
      const { error: deleteErr } = await supabase
        .from("rangers")
        .delete()
        .eq("id", ranger.id);
      if (deleteErr) throw deleteErr;

      // No need to update UI manually; reload will happen
      await sendNotificationEmail(ranger.email, "disabled");
    } catch (err) {
      setError("Error disabling ranger: " + err.message);
    }
  };

  const sendNotificationEmail = async (email, status) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/notify-ranger`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, status }),
        }
      );
      if (!response.ok) {
        console.error("Failed to send notification email");
      }
    } catch (error) {
      console.error("Error sending notification email:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6">
      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
        action={modalAction}
        ranger={selectedRanger}
      />
      <div className="flex-1">
        <h3 className="text-lg font-bold mb-4 text-green-800">
          Approved Rangers
        </h3>
        {loading ? (
          <div className="text-blue-500">Loading...</div>
        ) : (
          <div className="border rounded shadow bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approved.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-400">
                      No rangers.
                    </td>
                  </tr>
                ) : (
                  approved.map((r) => (
                    <tr key={r.id}>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.email}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            r.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {r.status === "active" && (
                          <button
                            onClick={() => openModal("disable", r)}
                            className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded"
                          >
                            Disable
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold mb-4 text-orange-700">
          Pending Approvals
        </h3>
        {loading ? (
          <div className="text-blue-500">Loading...</div>
        ) : (
          <div className="border rounded shadow bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-3 text-center text-gray-400">
                      No pending requests.
                    </td>
                  </tr>
                ) : (
                  pending.map((p) => (
                    <tr key={p.ranger_id || p.id}>
                      <td className="p-2">{p.name}</td>
                      <td className="p-2">{p.email}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => openModal("approve", p)}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleDisapprove(p)}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          title="Reject"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}
