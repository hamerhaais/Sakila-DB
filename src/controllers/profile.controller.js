const filmService = require('../services/film.service');
const usersService = require('../services/users.service');

const profileController = {

  returnRental: (req, res) => {
    const userId = req.user.userId;
    const filmId = req.params.filmId;
    filmService.returnRental(userId, filmId, (err) => {
      if (err) {
        req.flash('error', 'Inleveren mislukt.');
      } else {
        req.flash('success', 'Film succesvol ingeleverd!');
      }
      res.redirect('/profile/rentals');
    });
  },

  viewRentals: (req, res) => {
    const userId = req.user.userId;
    filmService.getRentedByUser(userId, (err, films) => {
      if (err) {
        req.flash('error', 'Kon gehuurde films niet ophalen.');
        return res.render('profile/rentals', {
          title: 'Mijn Huringen',
          user: req.user,
          films: []
        });
      }
      res.render('profile/rentals', {
        title: 'Mijn Huringen',
        user: req.user,
        films
      });
    });
  },

  showEdit: (req, res) => {
    const userId = req.user.userId;
    usersService.getById(userId, (err, user) => {
      if (err || !user) {
        req.flash('error', 'Kon profiel niet ophalen.');
        return res.redirect('/profile/rentals');
      }
      res.render('profile/edit', { title: 'Profiel Bewerken', user });
    });
  },

  deleteAccount: (req, res) => {
    const userId = req.user.userId;
    usersService.delete(userId, (err) => {
      if (err) {
        if (err.message && err.message.includes('worden nog films gehuurd')) {
          req.flash('error', 'Account kan niet verwijderd worden: er worden nog films gehuurd.');
        } else {
          req.flash('error', 'Account verwijderen mislukt.');
        }
        return res.redirect('/profile/edit');
      }
      res.clearCookie('token');
      req.flash('success', 'Je account is succesvol verwijderd.');
      res.redirect('/auth/login');
    });
  },

  updateProfile: (req, res) => {
    const { first_name, last_name, email } = req.body;
    const userId = req.user.userId;
    usersService.update(userId, first_name, last_name, email, 1, (err) => {
      if (err) {
        req.flash('error', 'Profiel bijwerken mislukt.');
        return res.redirect('/profile/edit');
      }
      req.flash('success', 'Profiel succesvol bijgewerkt!');
      res.redirect('/profile/edit');
    });
  }
};

module.exports = profileController;
