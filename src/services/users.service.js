const usersDao = require('../dao/usersDao');
const bcrypt = require('bcrypt');

const usersService = {
  findByEmail: (email, cb) => usersDao.findByEmail(email, cb),
  create: (user, cb) => {
    // user.password is plaintext here; hash it before DAO create
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) return cb(err);
      const toSave = Object.assign({}, user, { password: hash });
      usersDao.create(toSave, cb);
    });
  },
  getById: (id, cb) => usersDao.getById(id, cb),
  delete: (id, cb) => usersDao.delete(id, cb),
  // updatePassword now accepts plaintext password and hashes internally
  updatePassword: (id, pass, cb) => {
    bcrypt.hash(pass, 10, (err, hash) => {
      if (err) return cb(err);
      usersDao.updatePassword(id, hash, cb);
    });
  },
  // Update profile general info (wrap DAO)
  update: (userId, first_name, last_name, email, active, cb) => usersDao.update(userId, first_name, last_name, email, active, cb)
};

module.exports = usersService;
