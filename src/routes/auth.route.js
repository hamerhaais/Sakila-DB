const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Route om de loginpagina te tonen
router.get('/login', authController.showLogin);

// Route om de inloggegevens te verwerken
router.post('/login', authController.handleLogin);


// Route om registratiepagina te tonen
router.get('/register', authController.showRegister);
// Route om registratie te verwerken
router.post('/register', authController.handleRegister);

// Route om uit te loggen
router.get('/logout', authController.handleLogout);

module.exports = router;
