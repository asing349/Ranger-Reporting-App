// server/scripts/hashOnce.js
const { hashPassword } = require("../utils/hash");

(async () => {
  const hash = await hashPassword("ranger123"); // your admin password
  console.log("Hash:", hash);
  process.exit();
})();
