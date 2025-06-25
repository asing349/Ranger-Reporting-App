const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

global.supabase = supabase;

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mount register route
app.use("/api/register", require("./routes/register"));

app.use("/api", require("./routes/auth"));
app.use("/api/report", require("./routes/report"));

app.listen(5050, () => {
  console.log("✅ Server running on port 5050");
});
