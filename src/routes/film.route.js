const express = require('express');
const router = express.Router();
const filmController = require('../controllers/film.controller');

// Route voor het ophalen van de lijst met alle films
// URL: /films/
router.get('/', filmController.getAllFilms);


// Route voor het reserveren van een film
const { requireAuth } = require('../middleware/auth.middleware');
router.post('/:filmId/rent', requireAuth, filmController.rentFilm);

// Route voor het ophalen van de details van één film via zijn ID
// URL: /films/12/details (waarbij 12 het film_id is)
router.get('/:filmId/details', filmController.getFilmDetails);

module.exports = router;