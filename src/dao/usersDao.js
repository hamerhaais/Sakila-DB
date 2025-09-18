const database = require("../db/sql/connection");

const usersDao = {
  // Verwijder een gebruiker alleen als er geen openstaande boekingen zijn
  delete: (userId, callback) => {
    // Check op openstaande boekingen
    database.query(
      'SELECT COUNT(*) AS openRentals FROM rental WHERE customer_id = ? AND return_date IS NULL',
      [userId],
      (err, results) => {
        if (err) return callback(err);
        if (results[0].openRentals > 0) {
          // Er zijn nog open boekingen
          return callback(new Error('Er worden nog films gehuurd. Account kan niet verwijderd worden.'));
        }
        // Geen open boekingen, dus eerst alle rentals en payments verwijderen
        database.query(
          'DELETE FROM payment WHERE customer_id = ?',
          [userId],
          (err1) => {
            if (err1) {
              return callback(err1);
            }
            database.query(
              'DELETE FROM rental WHERE customer_id = ?',
              [userId],
              (err2) => {
                if (err2) {
                  return callback(err2);
                }
                database.query(
                  'DELETE FROM customer WHERE customer_id = ?',
                  [userId],
                  (error, delResults) => {
                    if (error) {
                      return callback(error);
                    }
                    callback(null, delResults);
                  }
                );
              }
            );
          }
        );
      }
    );
  },
  get: (userId, callback) => {
    database.query(
      userId == undefined
        ? `SELECT * FROM customer`
        : `SELECT * FROM customer WHERE customer_id = ?`,
      userId == undefined ? [] : [userId],
      (error, results) => {
        if (error) return callback(error, undefined);
        if (results) return callback(undefined, results);
      }
    );
  },
  
  // NIEUWE FUNCTIE: Zoek een gebruiker op e-mailadres

  findByEmail: (email, callback) => {
    database.query(
      `SELECT customer_id, first_name, last_name, email, password FROM customer WHERE email = ?`,
      [email],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results[0]);
      }
    );
  },

  create: (user, callback) => {
    // store_id en address_id zijn verplicht in Sakila; gebruik values uit user of default naar 1
    const storeId = user.store_id && Number.isInteger(user.store_id) ? user.store_id : (parseInt(user.store_id) || 1);
    const addressId = user.address_id && Number.isInteger(user.address_id) ? user.address_id : (parseInt(user.address_id) || 1);
    database.query(
      `INSERT INTO customer (store_id, address_id, first_name, last_name, email, password, create_date) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [storeId, addressId, user.first_name, user.last_name, user.email, user.password],
      (error, results) => {
        if (error) return callback(error, null);
        callback(null, results.insertId);
      }
    );
  },

  update: (userId, first_name, last_name, email, active, callback) => {
    database.query(
      `UPDATE customer SET first_name = ?, last_name = ?, email = ?, active = ? WHERE customer_id = ?`,
      [first_name, last_name, email, active, userId],
      (error, results) => {
        if (error) return callback(error);
        callback(null);
      }
    );
  },


  // Haal gebruiker op basis van ID
  getById: (userId, callback) => {
    database.query(
      `SELECT customer_id, first_name, last_name, email FROM customer WHERE customer_id = ?`,
      [userId],
      (error, results) => {
        if (error) return callback(error, null);
        callback(null, results[0]);
      }
    );
  },

};

module.exports = usersDao;
