const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🔌 Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, id, condition, notes, latitude, longitude } = req.body;
    const imagePath = req.file.path;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "ranger_reports",
    });

    // Delete the local image file
    fs.unlinkSync(imagePath);

    // Insert into Supabase `ranger_report` table
    const { error } = await supabase.from("ranger_reports").insert([
      {
        ranger_name: name,
        ranger_id: id,
        condition,
        notes,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        image_url: result.secure_url,
        created_at: new Date().toISOString(), // optional if Supabase has a default
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Database insert failed" });
    }

    return res.status(200).json({
      success: true,
      message: "Report submitted and stored in Supabase successfully",
    });
  } catch (err) {
    console.error("Report submission failed:", err);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;
