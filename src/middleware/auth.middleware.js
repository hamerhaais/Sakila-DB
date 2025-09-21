const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mijn-geheime-sleutel-voor-development';

// Middleware: check of gebruiker ingelogd is
function requireAuth(req, res, next) {
	const token = req.cookies.token;
	if (!token) {
		req.flash('error', 'Je moet ingelogd zijn om deze pagina te bekijken.');
		return res.redirect('/auth/login');
	}
	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) {
			req.flash('error', 'Je sessie is verlopen. Log opnieuw in.');
			return res.redirect('/auth/login');
		}
		req.user = decoded;
		next();
	});
}

module.exports = { requireAuth };
