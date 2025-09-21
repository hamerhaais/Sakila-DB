const addressDao = require('../dao/address.dao');

const addressService = {
  getAll: (cb) => {
    addressDao.getAll((err, results) => {
      if (err) return cb(err);
      return cb(null, results);
    });
  }
};

module.exports = addressService;
