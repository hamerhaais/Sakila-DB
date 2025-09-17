const database = require('../db/sql/connection');

const addressDao = {
  getAll: (callback) => {
    database.query(
      `SELECT address_id, address, district FROM address ORDER BY address_id LIMIT 200`,
      (err, results) => {
        if (err) return callback(err);
        return callback(null, results);
      }
    );
  }
};

module.exports = addressDao;
