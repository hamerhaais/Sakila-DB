
const filmService = require("../services/film.service");
const createError = require("http-errors");

const filmController = {
  // Functie voor het reserveren van een film
  rentFilm: (req, res, next) => {
    const filmId = req.params.filmId;
    const userId = req.user.userId;
    const storeId = req.body.store_id ? parseInt(req.body.store_id) : null;
    filmService.rentFilm(filmId, userId, storeId, (err, result) => {
      if (err) {
        req.flash('error', 'Kon film niet reserveren: ' + (err.message || 'Onbekende fout'));
        return res.redirect('/films/' + filmId + '/details');
      }
      req.flash('success', 'Film succesvol gereserveerd!');
      return res.redirect('/profile/rentals');
    });
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