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
          console.log("Error in film.dao.js getAll:", error);
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
          console.log("Error in film.dao.js getById:", error);
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
            console.log('Error availability query:', err2);
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
          console.log("Error in film.dao.js getRentedByUser:", error);
          return callback(error, undefined);
        }
        return callback(undefined, results);
      }
    );
  }
};

module.exports = filmDao;