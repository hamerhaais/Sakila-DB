
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');

var indexRouter = require('./src/routes/index.route');
var filmsRouter = require('./src/routes/film.route');
var authRouter = require('./src/routes/auth.route');
var profileRouter = require('./src/routes/profile.route');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(flash());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret_key-stan',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 20 * 60 * 1000
    }
  })
);

app.use(function (req, res, next) {
  res.locals.user = req.session && req.session.user;
  next();
});

app.use('/', indexRouter);
app.use('/films', filmsRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  if (err.status === 404) return res.render('error/404', { title: '404 - Niet gevonden' });
  return res.render('error/500', { title: '500 - Serverfout' });
});

module.exports = app;

// Start server when run directly (keeps nodemon running)
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

