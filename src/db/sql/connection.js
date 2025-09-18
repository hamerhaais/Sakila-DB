const mysql = require('mysql2');
// Load environment variables silently
require('dotenv').config({ debug: false });

const database = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306
});

database.connect((err) => {
  if (err) {
    // Silent failure: do not log per user request
    return;
  }
  // Verbonden met database
});

module.exports = database;
