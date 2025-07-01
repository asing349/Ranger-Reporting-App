const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

router.post("/notify-ranger", async (req, res) => {
  const { email, status } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!email || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const subject = `Your Ranger Account Status Has Been Updated`;
  const htmlContent = `
    <p>Hello,</p>
    <p>Your ranger account has been ${status}.</p>
    <p>Please contact the admin at <a href="mailto:${adminEmail}">${adminEmail}</a> for any inquiries.</p>
    <p>Thank you,</p>
    <p>The Ranger App Team</p>
  `;

  const result = await sendEmail(email, subject, htmlContent);

  if (result.success) {
    res.status(200).json({ message: "Email sent successfully" });
  } else {
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
