const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, ranger_id, email, password } = req.body;

    if (!name || !ranger_id || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash the password securely
    const password_hash = bcrypt.hashSync(password, 10);

    // Save to Supabase (pending_ranger_requests table)
    const { data, error } = await global.supabase
      .from("pending_ranger_requests")
      .insert([{ name, ranger_id, email, password_hash }]);

    if (error) throw new Error(error.message);

    res.status(201).json({ message: "Registration successful", data: data[0] });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

module.exports = router;
