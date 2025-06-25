import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function LoginPage({ setUser }) {
  const [role, setRole] = useState("ranger");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    new: 0,
    monitoring: 0,
    resolved: 0,
    good: 0,
    moderate: 0,
    bad: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const navigate = useNavigate();

  // ---- Line 19: Metrics Fetcher ----
  useEffect(() => {
    const fetchMetrics = async () => {
      setMetricsLoading(true);

      // Status metrics (lines 23-32)
      const statusCounts = {};
      for (const status of ["new", "monitoring", "resolved"]) {
        const { count } = await supabase
          .from("ranger_reports")
          .select("*", { count: "exact", head: true })
          .eq("status", status);
        statusCounts[status] = count || 0;
      }

      // Condition metrics (lines 34-46)
      let good = 0,
        moderate = 0,
        bad = 0;
      // Instead of separate queries, fetch all conditions and count in JS for safety!
      const { data: allConditions } = await supabase
        .from("ranger_reports")
        .select("condition");
      if (allConditions && allConditions.length > 0) {
        for (const row of allConditions) {
          const val = (row.condition || "").toLowerCase();
          if (val === "good") good++;
          else if (val === "moderate") moderate++;
          else if (val === "bad") bad++;
        }
      }

      setMetrics({
        ...statusCounts,
        good,
        moderate,
        bad,
      });
      setMetricsLoading(false);
    };

    fetchMetrics();
  }, []);

  // ---- Login Handler (unchanged) ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:5050/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/ranger-dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ---- Layout starts here ----
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="w-full py-8 bg-white flex flex-col items-center shadow">
        <h1 className="text-3xl font-bold tracking-tight text-blue-900">
          Ranger Reporting App
        </h1>
        <p className="text-base text-blue-700 mt-1 font-semibold">
          Making Monitoring easy
        </p>
      </div>

      {/* Split Content */}
      <div className="flex flex-1 justify-center items-center px-2 md:px-10">
        {/* Left: Metrics */}
        <div className="w-full md:w-1/2 max-w-md space-y-8 p-6">
          {/* Status Title */}
          <h2 className="text-lg font-bold text-gray-700 mb-1">Case Status</h2>
          {metricsLoading ? (
            <div className="animate-pulse text-blue-600">
              Loading metrics...
            </div>
          ) : (
            <div className="flex gap-4 mb-8">
              <MetricCard
                label="New"
                count={metrics.new}
                color="bg-orange-500"
              />
              <MetricCard
                label="Monitoring"
                count={metrics.monitoring}
                color="bg-blue-500"
              />
              <MetricCard
                label="Resolved"
                count={metrics.resolved}
                color="bg-yellow-900"
              />{" "}
              {/* Brown */}
            </div>
          )}
          {/* Condition Title */}
          <h2 className="text-lg font-bold text-gray-700 mb-1 mt-6">
            Condition Split
          </h2>
          {metricsLoading ? (
            <div className="animate-pulse text-blue-600">
              Loading metrics...
            </div>
          ) : (
            <div className="flex gap-4">
              <MetricCard
                label="Good"
                count={metrics.good}
                color="bg-green-500"
              />
              <MetricCard
                label="Moderate"
                count={metrics.moderate}
                color="bg-yellow-400"
              />
              <MetricCard label="Bad" count={metrics.bad} color="bg-red-500" />
            </div>
          )}
        </div>
        {/* Right: Login Form */}
        <div className="w-full md:w-1/2 max-w-md flex flex-col items-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg p-8 rounded-2xl w-full space-y-4"
          >
            <h2 className="text-2xl font-bold text-center mb-2">Sign In</h2>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Select Role:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="ranger">Ranger</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label className="text-sm flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="mr-2"
                />
                Show Password
              </label>
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center font-semibold">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
            {/* Register as Ranger */}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full mt-2 bg-gray-100 border border-blue-600 text-blue-700 font-semibold py-2 rounded hover:bg-blue-50 transition"
            >
              Register as Ranger
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Simple metric card for display
function MetricCard({ label, count, color }) {
  return (
    <div
      className={`flex flex-col items-center px-4 py-2 rounded-xl text-white shadow ${color} min-w-[90px]`}
    >
      <span className="text-lg font-bold">{count}</span>
      <span className="text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
