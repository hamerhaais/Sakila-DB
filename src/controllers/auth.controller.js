
const usersService = require('../services/users.service');
const authService = require('../services/auth.service');
const addressService = require('../services/address.service');
const logger = require('../util/logger');

const authController = {
  // Toon de loginpagina
  showLogin: (req, res) => {
    res.render('auth/login', { title: 'Inloggen' });
  },

  // Toon de registratiepagina (met adreslijst en winkels)
  showRegister: (req, res) => {
    addressService.getAll((err, results) => {
      if (err) {
        logger.error('Error fetching addresses for register:', err);
        return res.render('auth/register', { title: 'Registreren', addresses: [], stores: res.locals.stores || [] });
      }
      res.render('auth/register', { title: 'Registreren', addresses: results, stores: res.locals.stores || [] });
    });
  },

  // Verwerk de inlogpoging
  handleLogin: (req, res) => {
    const { email, password } = req.body;
    authService.login(email, password, (err, result) => {
      if (err) {
        req.flash('error', 'Er ging iets mis.');
        return res.redirect('/auth/login');
      }
      if (!result) {
        req.flash('error', 'Ongeldige email of wachtwoord.');
        return res.redirect('/auth/login');
      }
      res.cookie('token', result.token, { httpOnly: true });
      req.flash('success', 'Welkom terug!');
      res.redirect('/films');
    });
  },

  // Verwerk registratie
  handleRegister: (req, res) => {
    const { first_name, last_name, email, password, store_id, address_id } = req.body;
    usersService.findByEmail(email, (err, user) => {
      if (err) {
        req.flash('error', 'Er ging iets mis bij controleren van het emailadres.');
        return res.redirect('/auth/register');
      }
      if (user) {
        req.flash('error', 'Email is al in gebruik.');
        return res.redirect('/auth/register');
      }
      // Pass plaintext password to the service; it will hash before persisting
      const newUser = { first_name, last_name, email, password, store_id: parseInt(store_id) || 1, address_id: parseInt(address_id) || 1 };
      usersService.create(newUser, (err, newUserId) => {
        if (err) {
          logger.error('usersDao.create error:', err);
          req.flash('error', 'Registratie mislukt.');
          return res.redirect('/auth/register');
        }
        req.flash('success', 'Registratie gelukt! Je kunt nu inloggen.');
        res.redirect('/auth/login');
      });
    });
  },

  // Log de gebruiker uit
  handleLogout: (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
  }
};

module.exports = authController;
