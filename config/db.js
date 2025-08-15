const { Pool } = require("pg");
const { DB_URL } = require("./env");

const pool = new Pool({
  connectionString: DB_URL,
  // في العادة مش محتاج تضيف ssl هنا عشان sslmode=require موجود في اليو آر إل
  // لو بيئتك مصرّة:
  // ssl: { rejectUnauthorized: false },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
