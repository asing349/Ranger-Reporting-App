import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ThankYouPage from "./components/ThankYouPage";
import RangerDashboard from "./components/RangerDashboard"; // <- import new dashboard
import "leaflet/dist/leaflet.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const isAdmin = user?.role === "admin";
  const isRanger = user?.role === "ranger";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl font-bold text-blue-600 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      {(isAdmin || isRanger) && (
        <nav className="bg-gray-200 p-4 flex space-x-4">
          {isAdmin && <Link to="/dashboard">🛡️ Admin Dashboard</Link>}
          {isRanger && <Link to="/ranger-dashboard">🧑‍✈️ Ranger Dashboard</Link>}
        </nav>
      )}

      <Routes>
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route
          path="/dashboard"
          element={isAdmin ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/ranger-dashboard"
          element={isRanger ? <RangerDashboard /> : <Navigate to="/login" />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        {/* Default redirect based on user role */}
        <Route
          path="/"
          element={
            user ? (
              isAdmin ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/ranger-dashboard" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Optionally, catch-all route to redirect unknown paths */}
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
