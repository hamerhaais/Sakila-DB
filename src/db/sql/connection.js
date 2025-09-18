const mysql = require('mysql2');
require('dotenv').config();
const logger = require('../../util/logger');

const database = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306
});

database.connect((err) => {
  if (err) {
    logger.error('Database connection failed:', err.stack);
    return;
  }
  // Verbonden met database
});

module.exports = database;
