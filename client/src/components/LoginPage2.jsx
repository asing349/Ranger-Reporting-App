import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ setUser }) {
  const [role, setRole] = useState("ranger");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      // Store login info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update App state immediately
      setUser(data.user);

      // Redirect by role
      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/form");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-6 rounded-xl w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Ranger App Login</h2>

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
      </form>
    </div>
  );
}
