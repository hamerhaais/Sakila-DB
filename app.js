
var createError = require('http-errors');
var express = require('express');
var path = require('path');

var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');

// Import routes
var indexRouter = require('./src/routes/index.route');
// const usersRouter = require('./src/routes/users.route'); // Oude code, niet nodig
// const addressRouter = require("./src/routes/address.route"); // Oude code, niet nodig
const filmRouter = require("./src/routes/film.route");
const authRouter = require("./src/routes/auth.route");
const profileRouter = require("./src/routes/profile.route");


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'supergeheim',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Middleware om flash messages en user info aan alle views te geven
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mijn-geheime-sleutel-voor-development';
app.use(function(req, res, next) {
  res.locals.flash = {
    success: req.flash('success'),
    error: req.flash('error')
  };
  // JWT uit cookie halen en decoden
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err && decoded) {
        req.user = decoded;
        res.locals.user = decoded;
      } else {
        res.locals.user = null;
      }
      next();
    });
  } else {
    res.locals.user = null;
    next();
  }
});

// Lees central store-definities en maak beschikbaar in alle views
const storesConfig = require('./src/config/stores');
app.use(function(req, res, next) {
  res.locals.stores = storesConfig;
  // Maak een snelle lookup (id -> naam) beschikbaar voor templates
  res.locals.storeMap = (storesConfig || []).reduce((map, s) => {
    map[s.id] = s.name;
    return map;
  }, {});
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'supergeheim',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Activate routes
app.use('/', indexRouter);
// app.use('/users', usersRouter); // Oude code, niet nodig
app.use('/films', filmRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
// app.use('/address', addressRouter); // Oude code, niet nodig

// catch 404 and forward to error handler

// Custom 404 handler
app.use(function(req, res, next) {
  res.status(404);
  res.render('error/404', { title: '404 - Niet gevonden' });
});

// error handler


// Custom 500 handler
app.use(function(err, req, res, next) {
  console.error('Express error:', err); // <-- logt ALLES
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error/500', { title: '500 - Serverfout' });
});

// --- NIEUW GEDEELTE: START DE SERVER ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  // Server gestart
});
// --- EINDE NIEUW GEDEELTE ---


module.exports = app;

