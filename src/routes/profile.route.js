const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const profileController = require('../controllers/profile.controller');

// NOTE: reset-all-rentals helper removed for safety. If you need a one-off
// data migration or reset, run a dedicated script with proper safeguards.

// Film inleveren (return)
router.post('/rentals/:filmId/return', requireAuth, profileController.returnRental);

// Profielpagina: Mijn Huringen
router.get('/rentals', requireAuth, profileController.viewRentals);

// Profiel bewerken (GET)
router.get('/edit', requireAuth, profileController.showEdit);

// Profiel bewerken (POST)
// Account verwijderen (POST)
router.post('/delete', requireAuth, profileController.deleteAccount);
router.post('/edit', requireAuth, profileController.updateProfile);

module.exports = router;
