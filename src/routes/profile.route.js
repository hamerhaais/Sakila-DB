const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const filmService = require('../services/film.service');
const usersDao = require('../dao/usersDao');
const database = require('../db/sql/connection');
const bcrypt = require('bcrypt');

// Admin/test route: reset alle openstaande reserveringen
router.post('/rentals/reset', requireAuth, (req, res) => {
  database.query(
    `UPDATE rental SET return_date = NOW() WHERE return_date IS NULL`,
    (err, result) => {
      if (err) {
        req.flash('error', 'Reset mislukt.');
      } else {
        req.flash('success', 'Alle reserveringen zijn gereset!');
      }
      res.redirect('/profile/rentals');
    }
  );
});

// Film inleveren (return)
router.post('/rentals/:filmId/return', requireAuth, (req, res) => {
  const userId = req.user.userId;
  const filmId = req.params.filmId;
  // Zoek de openstaande rental voor deze user en film
  database.query(
    `UPDATE rental r
     JOIN inventory i ON r.inventory_id = i.inventory_id
     SET r.return_date = NOW()
     WHERE r.customer_id = ? AND i.film_id = ? AND r.return_date IS NULL`,
    [userId, filmId],
    (err, result) => {
      if (err) {
        req.flash('error', 'Inleveren mislukt.');
      } else {
        req.flash('success', 'Film succesvol ingeleverd!');
      }
      res.redirect('/profile/rentals');
    }
  );
});

// Profielpagina: Mijn Huringen
router.get('/rentals', requireAuth, (req, res) => {
  const userId = req.user.userId;
  filmService.getRentedByUser(userId, (err, films) => {
    if (err) {
      req.flash('error', 'Kon gehuurde films niet ophalen.');
      return res.render('profile/rentals', {
        title: 'Mijn Huringen',
        user: req.user,
        films: []
      });
    }
    res.render('profile/rentals', {
      title: 'Mijn Huringen',
      user: req.user,
      films
    });
  });
});

// Profiel bewerken (GET)
router.get('/edit', requireAuth, (req, res) => {
  const userId = req.user.userId;
  usersDao.getById(userId, (err, user) => {
    if (err || !user) {
      req.flash('error', 'Kon profiel niet ophalen.');
      return res.redirect('/profile/rentals');
    }
    res.render('profile/edit', {
      title: 'Profiel Bewerken',
      user
    });
  });
});

// Profiel bewerken (POST)
// Account verwijderen (POST)
router.post('/delete', requireAuth, (req, res) => {
  const userId = req.user.userId;
  usersDao.delete(userId, (err) => {
    if (err) {
      if (err.message && err.message.includes('worden nog films gehuurd')) {
        req.flash('error', 'Account kan niet verwijderd worden: er worden nog films gehuurd.');
      } else {
        req.flash('error', 'Account verwijderen mislukt.');
      }
      return res.redirect('/profile/edit');
    }
    res.clearCookie('token');
    req.flash('success', 'Je account is succesvol verwijderd.');
    res.redirect('/auth/login');
  });
});
router.post('/edit', requireAuth, (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const userId = req.user.userId;
  // Update profiel info
  usersDao.update(userId, first_name, last_name, email, 1, (err) => {
    if (err) {
      req.flash('error', 'Profiel bijwerken mislukt.');
      return res.redirect('/profile/edit');
    }
    // Wachtwoord wijzigen indien ingevuld
    if (password && password.length > 0) {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          req.flash('error', 'Wachtwoord wijzigen mislukt.');
          return res.redirect('/profile/edit');
        }
        usersDao.updatePassword(userId, hash, (err) => {
          if (err) {
            req.flash('error', 'Wachtwoord wijzigen mislukt.');
            return res.redirect('/profile/edit');
          }
          req.flash('success', 'Profiel en wachtwoord succesvol bijgewerkt!');
          res.redirect('/profile/edit');
        });
      });
    } else {
      req.flash('success', 'Profiel succesvol bijgewerkt!');
      res.redirect('/profile/edit');
    }
  });
});

module.exports = router;
