
const filmService = require("../services/film.service");
const createError = require("http-errors");
const database = require('../db/sql/connection');

const filmController = {
  // Functie voor het reserveren van een film
  rentFilm: (req, res, next) => {
    const filmId = req.params.filmId;
    const userId = req.user.userId;
    const storeId = req.body.store_id ? parseInt(req.body.store_id) : null;
    // Zoek een vrije inventory_id voor deze film
    const inventoryQuery = storeId ?
      `SELECT inventory_id FROM inventory WHERE film_id = ? AND store_id = ? AND inventory_id NOT IN (SELECT inventory_id FROM rental WHERE return_date IS NULL) LIMIT 1` :
      `SELECT inventory_id FROM inventory WHERE film_id = ? AND inventory_id NOT IN (SELECT inventory_id FROM rental WHERE return_date IS NULL) LIMIT 1`;
    const params = storeId ? [filmId, storeId] : [filmId];
    database.query(
      inventoryQuery,
      params,
      (err, invResults) => {
        if (err || !invResults.length) {
          req.flash('error', 'Geen exemplaren beschikbaar voor deze film.');
          return res.redirect('/films/' + filmId + '/details');
        }
        const inventoryId = invResults[0].inventory_id;
        database.query(
          `INSERT INTO rental (rental_date, inventory_id, customer_id, return_date, staff_id) VALUES (NOW(), ?, ?, NULL, 1)`,
          [inventoryId, userId],
          (error, results) => {
            if (error) {
              req.flash('error', 'Reserveren mislukt.');
              return res.redirect('/films/' + filmId + '/details');
            }
            req.flash('success', 'Film succesvol gereserveerd!');
            res.redirect('/profile/rentals');
          }
        );
      }
    );
  },

  // Functie voor het afhandelen van het verzoek voor alle films
  getAllFilms: (req, res, next) => {
    filmService.getAll((error, films) => {
      if (error) return next(error);
      const genres = [...new Set(films.map(f => f.genre))].sort();
      let filtered = films;
      const q = req.query.q;
      const selectedGenre = req.query.genre;
      if (q) {
        filtered = filtered.filter(film => film.title.toLowerCase().includes(q.toLowerCase()));
      }
      if (selectedGenre && selectedGenre.length > 0) {
        filtered = filtered.filter(film => film.genre === selectedGenre);
      }
      res.render("films/overview", {
        films: filtered,
        title: "Film Overzicht",
        q,
        genres,
        selectedGenre
      });
    });
  },

  // Functie voor het afhandelen van het verzoek voor de details van één film
  getFilmDetails: (req, res, next) => {
    const filmId = req.params.filmId;
    filmService.getById(filmId, (error, film) => {
      if (error) {
        return next(error);
      }
      if(film) {
        res.render("films/details", { film: film, title: film.title });
      } else {
        return next(createError(404, "Film not found"));
      }
    });
  }
};

module.exports = filmController;