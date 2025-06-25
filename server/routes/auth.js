const express = require("express");
const router = express.Router();
const { comparePassword } = require("../utils/hash");
const jwt = require("jsonwebtoken");

// POST /api/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Input validation
    if (!email || !password || !role) {
      return res.status(400).json({ error: "Missing login credentials." });
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const table = role === "admin" ? "admin" : "rangers";

    // Log incoming data for debugging
    console.log("🔐 Login attempt:", { role, email: normalizedEmail });

    // Query Supabase
    const { data, error } = await global.supabase
      .from(table)
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    console.log("📦 Supabase response:", { data, error });

    if (error || !data) {
      return res.status(404).json({ error: "User not found." });
    }

    // Password comparison
    const isMatch = await comparePassword(password, data.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    // Token generation
    const token = jwt.sign(
      { id: data.id, role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "2h" }
    );

    // Successful response
    res.json({
      token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role,
      },
    });
  } catch (err) {
    console.error("🚨 Login error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
