const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const profileController = require('../controllers/profile.controller');

// Admin/test route: reset alle openstaande reserveringen
// This route is an administrative / test helper that resets all rentals to returned.
// It is potentially dangerous and should NOT be exposed in production. Register
// it only when the environment variable ENABLE_RENTAL_RESET is set to 'true'.
if (process.env.ENABLE_RENTAL_RESET === 'true') {
	router.post('/rentals/reset', requireAuth, profileController.resetAllRentals);
}

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
