import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import bcrypt from "bcryptjs";

// Simple email validation regex
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    ranger_id: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldError((prev) => ({ ...prev, [e.target.name]: "" }));
    setError("");
  };

  const validate = () => {
    let errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.ranger_id.trim()) errs.ranger_id = "Ranger ID is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!isValidEmail(form.email)) errs.email = "Email is invalid";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldError(errs);
      setSubmitting(false);
      return;
    }
    try {
      // Hash the password using bcryptjs
      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync(form.password, salt);

      // Insert into Supabase
      const { error } = await supabase.from("pending_ranger_requests").insert([
        {
          name: form.name,
          ranger_id: form.ranger_id,
          email: form.email,
          password_hash,
        },
      ]);
      if (error) throw new Error(error.message);

      // Redirect to Thank You page
      navigate("/thank-you");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Register as Ranger
        </h2>
        <div>
          <label className="block mb-1 font-medium">Full Name</label>
          <input
            name="name"
            type="text"
            className={`w-full border p-2 rounded ${
              fieldError.name ? "border-red-400" : ""
            }`}
            value={form.name}
            onChange={handleChange}
            required
          />
          {fieldError.name && (
            <p className="text-xs text-red-500">{fieldError.name}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Ranger ID</label>
          <input
            name="ranger_id"
            type="text"
            className={`w-full border p-2 rounded ${
              fieldError.ranger_id ? "border-red-400" : ""
            }`}
            value={form.ranger_id}
            onChange={handleChange}
            required
          />
          {fieldError.ranger_id && (
            <p className="text-xs text-red-500">{fieldError.ranger_id}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            name="email"
            type="email"
            className={`w-full border p-2 rounded ${
              fieldError.email ? "border-red-400" : ""
            }`}
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          {fieldError.email && (
            <p className="text-xs text-red-500">{fieldError.email}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            className={`w-full border p-2 rounded ${
              fieldError.password ? "border-red-400" : ""
            }`}
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
          />
          {fieldError.password && (
            <p className="text-xs text-red-500">{fieldError.password}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            className={`w-full border p-2 rounded ${
              fieldError.confirmPassword ? "border-red-400" : ""
            }`}
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          {fieldError.confirmPassword && (
            <p className="text-xs text-red-500">{fieldError.confirmPassword}</p>
          )}
          <label className="text-sm flex items-center mt-1">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((v) => !v)}
              className="mr-2"
            />
            Show Passwords
          </label>
        </div>
        {error && (
          <div className="text-red-600 font-semibold text-center">{error}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-700 text-white font-bold py-2 rounded hover:bg-blue-800"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Register"}
        </button>
      </form>
    </div>
  );
}
