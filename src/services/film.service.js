const filmDao = require("../dao/film.dao");

const filmService = {
  getAll: (callback) => {
    filmDao.getAll((err, data) => {
      if (err) return callback(err, null);
      callback(null, data);
    });
  },

  getById: (filmId, callback) => {
    filmDao.getById(filmId, (err, data) => {
        if (err) return callback(err, null);
        callback(null, data);
    });
  },

  getRentedByUser: (userId, callback) => {
    filmDao.getRentedByUser(userId, (err, data) => {
      if (err) return callback(err, null);
      callback(null, data);
    });
  }
  , findAvailableInventory: (filmId, storeId, callback) => {
    filmDao.findAvailableInventory(filmId, storeId, callback);
  }
  , rentFilm: (filmId, customerId, storeId, callback) => {
    // Find an available inventory, then create a rental
    filmDao.findAvailableInventory(filmId, storeId, (err, invResults) => {
      if (err) return callback(err);
      if (!invResults || !invResults.length) return callback(new Error('No inventory available'));
      const inventoryId = invResults[0].inventory_id;
      filmDao.createRental(inventoryId, customerId, (err, rentalId) => {
        if (err) return callback(err);
        return callback(null, { rentalId, inventoryId });
      });
    });
  }
  , resetAllRentals: (callback) => {
    filmDao.resetAllRentals(callback);
  }
  , returnRental: (customerId, filmId, callback) => {
    filmDao.returnRental(customerId, filmId, callback);
  }
};

module.exports = filmService;