const SibApiV3Sdk = require("@getbrevo/brevo");

const sendEmail = async (to, subject, htmlContent) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const apiKey = apiInstance.authentications["apiKey"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  console.log("Attempting to send email...");
  console.log("Brevo API Key (last 4 chars):", process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.slice(-4) : "Not set");
  console.log("Admin Email:", process.env.ADMIN_EMAIL || "Not set");
  console.log("To:", to);
  console.log("Subject:", subject);
  // console.log("HTML Content:", htmlContent); // Uncomment for full content debug

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: "Ranger App Admin",
    email: process.env.ADMIN_EMAIL,
  };
  sendSmtpEmail.to = [{ email: to }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Brevo API call successful. Response: " + JSON.stringify(data));
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email via Brevo API:", error.response ? error.response.body : error);
    return { success: false, error: error.response ? error.response.body : error };
  }
};

module.exports = sendEmail;
