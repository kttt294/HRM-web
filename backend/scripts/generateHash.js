const bcrypt = require("bcryptjs");

/**
 * Script để generate bcrypt hash cho password
 * Chạy: node backend/scripts/generateHash.js
 */

const passwords = {
  admin123: null,
  hr123: null,
  employee123: null,
  123456: null,
};

async function generateHashes() {
  console.log("🔐 Generating password hashes...\n");

  for (const password in passwords) {
    const hash = await bcrypt.hash(password, 10);
    passwords[password] = hash;
    console.log(`Password: "${password}"`);
    console.log(`Hash: ${hash}\n`);
  }

  console.log("✅ Hoàn tất! Copy các hash trên vào file seed_v2.sql");
  console.log("\nSQL Update Example:");
  console.log(
    `UPDATE users SET password = '${passwords["admin123"]}' WHERE username = 'admin';`,
  );
  console.log(
    `UPDATE users SET password = '${passwords["hr123"]}' WHERE username = 'hr';`,
  );
  console.log(
    `UPDATE users SET password = '${passwords["employee123"]}' WHERE username = 'nhanvien';`,
  );
}

generateHashes().catch(console.error);
