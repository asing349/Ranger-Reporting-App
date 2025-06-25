import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function RangersPanel() {
  const [approved, setApproved] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch both lists on mount
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

  // Approve ranger: move from pending → rangers, remove from pending
  const handleApprove = async (pendingRanger) => {
    setError("");
    try {
      // Add to rangers table (use same fields as your rangers table)
      const { error: insertErr } = await supabase.from("rangers").insert([
        {
          id: pendingRanger.ranger_id,
          name: pendingRanger.name,
          email: pendingRanger.email,
          password: pendingRanger.password_hash, // hashes match
          phone: "", // empty, or add a phone field to pending if you want
          status: "active",
        },
      ]);
      if (insertErr) throw insertErr;

      // Remove from pending
      const { error: deleteErr } = await supabase
        .from("pending_ranger_requests")
        .delete()
        .eq("id", pendingRanger.id);
      if (deleteErr) throw deleteErr;

      // Update UI
      setApproved((prev) => [
        ...prev,
        {
          id: pendingRanger.ranger_id,
          name: pendingRanger.name,
          email: pendingRanger.email,
          password: pendingRanger.password_hash,
          phone: "",
          status: "active",
        },
      ]);
      setPending((prev) => prev.filter((r) => r.id !== pendingRanger.id));
    } catch (err) {
      setError("Error approving ranger: " + err.message);
    }
  };

  // Disapprove = delete from pending only
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

  // Remove/disable approved ranger
  const handleDisable = async (ranger) => {
    setError("");
    try {
      // Set status to "inactive"
      const { error } = await supabase
        .from("rangers")
        .update({ status: "inactive" })
        .eq("id", ranger.id);
      if (error) throw error;
      setApproved((prev) =>
        prev.map((r) => (r.id === ranger.id ? { ...r, status: "inactive" } : r))
      );
    } catch (err) {
      setError("Error updating ranger: " + err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6">
      {/* Approved Rangers */}
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
                {approved.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-400">
                      No rangers.
                    </td>
                  </tr>
                )}
                {approved.map((r) => (
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
                          onClick={() => handleDisable(r)}
                          className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded"
                        >
                          Disable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Approvals */}
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
                {pending.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-3 text-center text-gray-400">
                      No pending requests.
                    </td>
                  </tr>
                )}
                {pending.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.email}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => handleApprove(p)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}
