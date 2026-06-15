// Generates bcrypt hashes for all 10 seed users.
// Run once after seed.sql:  node server/db/seed_passwords.js
// Password for every user: password123

const bcrypt = require('bcrypt');
const pool   = require('./connection');

const PASSWORD    = 'password123';
const SALT_ROUNDS = 10;

async function run() {
  console.log('Hashing password (this takes a few seconds)...');

  for (let userId = 1; userId <= 10; userId++) {
    const hash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);
    await pool.query(
      `INSERT INTO passwords (user_id, password_hash)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [userId, hash]
    );
    console.log(`  user_id ${userId} ✓`);
  }

  console.log(`\nDone. All 10 users can log in with password: ${PASSWORD}`);
  await pool.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
