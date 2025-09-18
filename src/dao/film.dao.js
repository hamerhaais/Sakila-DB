const database = require("../db/sql/connection");

const filmDao = {
  // Functie om alle films met hun genre op te halen
  getAll: (callback) => {
    // Haal rating mee
    database.query(
      `SELECT film.film_id, film.title, category.name as genre, film.release_year, film.description, film.rating
       FROM film
       JOIN film_category ON film.film_id = film_category.film_id
       JOIN category ON film_category.category_id = category.category_id
       ORDER BY film.title ASC;`,
      (error, results) => {
        if (error) {
          return callback(error, undefined);
        }
        return callback(undefined, results);
      }
    );
  },

  // Functie om één specifieke film op te halen op basis van ID
  getById: (filmId, callback) => {
    // Haal film + rating
    database.query(
      `SELECT film.*, language.name AS language
       FROM film
       JOIN language ON film.language_id = language.language_id
       WHERE film.film_id = ?`,
      [filmId],
      (error, results) => {
        if (error) {
          return callback(error, undefined);
        }
        const film = results[0];
        if (!film) return callback(null, null);

        // Bereken beschikbaarheid per store: aantal inventory per store minus open rentals
        const availabilityQuery = `
          SELECT s.store_id,
                 COUNT(i.inventory_id) AS total,
                 (COUNT(i.inventory_id) - IFNULL(SUM(rnt.open_rented),0)) AS available
          FROM inventory i
          JOIN store s ON i.store_id = s.store_id
          LEFT JOIN (
            SELECT inventory_id, COUNT(*) as open_rented FROM rental WHERE return_date IS NULL GROUP BY inventory_id
          ) rnt ON rnt.inventory_id = i.inventory_id
          WHERE i.film_id = ?
          GROUP BY s.store_id;`;

        database.query(availabilityQuery, [filmId], (err2, availResults) => {
          if (err2) {
            return callback(err2, undefined);
          }
          // Map availability by store id
          const availability = {};
          availResults.forEach(row => {
            availability[row.store_id] = { total: row.total, available: row.available };
          });
          film.availability = availability;
          return callback(undefined, film);
        });
      }
    );
  },

  // Haal alle gehuurde films van een gebruiker op
  getRentedByUser: (userId, callback) => {
    database.query(
      `SELECT film.film_id, film.title, category.name as genre, film.release_year, film.description, rental.rental_date, rental.return_date
       FROM rental
       JOIN inventory ON rental.inventory_id = inventory.inventory_id
       JOIN film ON inventory.film_id = film.film_id
       JOIN film_category ON film.film_id = film_category.film_id
       JOIN category ON film_category.category_id = category.category_id
       WHERE rental.customer_id = ?
       ORDER BY rental.rental_date DESC;`,
      [userId],
      (error, results) => {
        if (error) {
          logger.error("Error in film.dao.js getRentedByUser:", error);
          return callback(error, undefined);
        }
        return callback(undefined, results);
      }
    );
  }

  , findAvailableInventory: (filmId, storeId, callback) => {
    const inventoryQuery = storeId ?
      `SELECT inventory_id FROM inventory WHERE film_id = ? AND store_id = ? AND inventory_id NOT IN (SELECT inventory_id FROM rental WHERE return_date IS NULL) LIMIT 1` :
      `SELECT inventory_id FROM inventory WHERE film_id = ? AND inventory_id NOT IN (SELECT inventory_id FROM rental WHERE return_date IS NULL) LIMIT 1`;
    const params = storeId ? [filmId, storeId] : [filmId];
    database.query(inventoryQuery, params, (err, results) => {
      if (err) return callback(err);
      return callback(null, results);
    });
  },

  createRental: (inventoryId, customerId, callback) => {
    database.query(
      `INSERT INTO rental (rental_date, inventory_id, customer_id, return_date, staff_id) VALUES (NOW(), ?, ?, NULL, 1)`,
      [inventoryId, customerId],
      (err, result) => {
        if (err) return callback(err);
        return callback(null, result.insertId);
      }
    );
  },
  returnRental: (customerId, filmId, callback) => {
    database.query(
      `UPDATE rental r
       JOIN inventory i ON r.inventory_id = i.inventory_id
       SET r.return_date = NOW()
       WHERE r.customer_id = ? AND i.film_id = ? AND r.return_date IS NULL`,
      [customerId, filmId],
      (err, result) => {
        if (err) return callback(err);
        return callback(null, result);
      }
    );
  }
};

module.exports = filmDao;