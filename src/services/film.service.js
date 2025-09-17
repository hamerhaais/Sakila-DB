const filmDao = require("../dao/film.dao");

const filmService = {
  getAll: (store_id, callback) => {
    filmDao.getAll(store_id, (err, data) => {
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
};

module.exports = filmService;