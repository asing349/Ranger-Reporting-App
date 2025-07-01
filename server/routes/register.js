const express = require("express");
const router = express.Router();
const { hashPassword } = require("../utils/hash"); // Import hashPassword

router.post("/", async (req, res) => {
  try {
    const { name, ranger_id, email, password } = req.body;

    if (!name || !ranger_id || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash the password securely using the async hashPassword
    const password_hash = await hashPassword(password);

    // Save to Supabase (pending_ranger_requests table)
    const { data, error } = await global.supabase
      .from("pending_ranger_requests")
      .insert([{ name, ranger_id, email, password_hash }])
      .select();

    if (error) throw new Error(error.message);
    if (!data || !data[0]) {
      return res.status(500).json({
        error: "Registration failed: No data returned from database.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: data[0],
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

module.exports = router;
