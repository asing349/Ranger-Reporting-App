import { useState, useEffect } from "react";
import exifr from "exifr";
import LogoutButton from "./LogoutButton";

export default function Form() {
  const [form, setForm] = useState({
    name: "",
    id: "",
    condition: "",
    notes: "",
    latitude: "",
    longitude: "",
    image: null,
  });

  // ✅ Auto-fill name and id from logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        id: user.id || "",
      }));
    }
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const gps = await exifr.gps(file);
    setForm((prev) => ({
      ...prev,
      image: file,
      latitude: gps?.latitude || "",
      longitude: gps?.longitude || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));

    const res = await fetch("http://localhost:5050/api/report", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    alert(result.success ? "✅ Report submitted!" : "❌ Failed to submit.");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold">📋 Ranger Report</h2>
        <LogoutButton />
      </div>

      <form
        className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Ranger Name"
          value={form.name}
          readOnly
          className="w-full border p-2 bg-gray-100 cursor-not-allowed"
        />

        <input
          type="text"
          placeholder="Ranger ID"
          value={form.id}
          readOnly
          className="w-full border p-2 bg-gray-100 cursor-not-allowed"
        />

        <input
          type="file"
          accept="image/*"
          className="w-full border p-2"
          onChange={handleFileChange}
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Latitude"
            value={form.latitude}
            readOnly
            className="w-1/2 border p-2 bg-gray-100"
          />
          <input
            type="text"
            placeholder="Longitude"
            value={form.longitude}
            readOnly
            className="w-1/2 border p-2 bg-gray-100"
          />
        </div>

        <select
          className="w-full border p-2"
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
        >
          <option value="">Select Condition</option>
          <option>Good</option>
          <option>Moderate</option>
          <option>Bad</option>
        </select>

        <textarea
          placeholder="Notes"
          className="w-full border p-2"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        ></textarea>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 rounded"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}
