const express = require('express');
const router = express.Router();

// Homepagina
router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// About pagina
router.get('/about', (req, res) => {
  res.render('about', { title: 'Over deze applicatie' });
});

module.exports = router;
