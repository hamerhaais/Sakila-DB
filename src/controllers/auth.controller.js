
const usersDao = require('../dao/usersDao');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const database = require('../db/sql/connection');
const JWT_SECRET = process.env.JWT_SECRET || 'mijn-geheime-sleutel-voor-development';

const authController = {
  // Toon de loginpagina
  showLogin: (req, res) => {
    res.render('auth/login', { title: 'Inloggen' });
  },

  // Toon de registratiepagina (met adreslijst en winkels)
  showRegister: (req, res) => {
    database.query(
      `SELECT address_id, address, district FROM address ORDER BY address_id LIMIT 200`,
      (err, results) => {
        if (err) {
          console.error('Error fetching addresses for register:', err);
          return res.render('auth/register', { title: 'Registreren', addresses: [], stores: res.locals.stores || [] });
        }
        res.render('auth/register', { title: 'Registreren', addresses: results, stores: res.locals.stores || [] });
      }
    );
  },

  // Verwerk de inlogpoging
  handleLogin: (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    usersDao.findByEmail(email, (err, user) => {
      console.log('findByEmail error:', err);
      console.log('findByEmail user:', user);
      if (err) {
        req.flash('error', 'Er ging iets mis.');
        return res.redirect('/auth/login');
      }
      if (!user) {
        req.flash('error', 'Ongeldige email of wachtwoord.');
        return res.redirect('/auth/login');
      }
      bcrypt.compare(password, user.password, (err, result) => {
        console.log('bcrypt.compare error:', err);
        console.log('bcrypt.compare result:', result);
        if (err || !result) {
          req.flash('error', 'Ongeldige email of wachtwoord.');
          return res.redirect('/auth/login');
        }
        const payload = {
          userId: user.customer_id,
          firstName: user.first_name
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        req.flash('success', 'Welkom terug!');
        res.redirect('/films');
      });
    });
  },

  // Verwerk registratie
  handleRegister: (req, res) => {
    const { first_name, last_name, email, password, store_id, address_id } = req.body;
    console.log('Register attempt:', email);
    usersDao.findByEmail(email, (err, user) => {
      if (err) {
        req.flash('error', 'Er ging iets mis bij controleren van het emailadres.');
        return res.redirect('/auth/register');
      }
      if (user) {
        req.flash('error', 'Email is al in gebruik.');
        return res.redirect('/auth/register');
      }
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          req.flash('error', 'Er ging iets mis.');
          return res.redirect('/auth/register');
        }
        const newUser = { first_name, last_name, email, password: hash, store_id: parseInt(store_id) || 1, address_id: parseInt(address_id) || 1 };
        usersDao.create(newUser, (err, newUserId) => {
          if (err) {
            console.log('usersDao.create error:', err);
            req.flash('error', 'Registratie mislukt.');
            return res.redirect('/auth/register');
          }
          req.flash('success', 'Registratie gelukt! Je kunt nu inloggen.');
          res.redirect('/auth/login');
        });
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
