const { comparePassword } = require("../utils/hash");

const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  let user;
  if (role === "admin") {
    const result = await pool.query("SELECT * FROM admin WHERE email = $1", [
      email,
    ]);
    user = result.rows[0];
  } else if (role === "ranger") {
    const result = await pool.query("SELECT * FROM rangers WHERE email = $1", [
      email,
    ]);
    user = result.rows[0];
  }

  if (!user) return res.status(404).json({ error: "User not found" });

  const match = await comparePassword(password, user.password); // ✅ bcrypt compare
  if (!match) return res.status(401).json({ error: "Incorrect password" });

  // Continue with token issuance
};
