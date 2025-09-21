const usersService = require('./users.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;

const authService = {
  // Attempt to authenticate a user by email/password
  // callback signature: (err, { user, token } )
  login: (email, password, cb) => {
    usersService.findByEmail(email, (err, user) => {
      if (err) return cb(err);
      if (!user) return cb(null, null);
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) return cb(err);
        if (!result) return cb(null, null);
        const payload = { userId: user.customer_id, firstName: user.first_name };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        return cb(null, { user, token });
      });
    });
  }
};

module.exports = authService;
