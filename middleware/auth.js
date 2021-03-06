const { Users } = require('../data/db');

async function auth(req, res, next) {
	let token = false;
	let authUser = false;
	if (req.session) {
		token = req.session.token;
	}

	if (token) {
		authUser = await Users.findOne({
			where: {
				token: token
			}
		});
	}

	if (authUser) {
		req.user = authUser;
		next();
	} else {
		res.redirect('/regis.html');
	}
}

module.exports = { auth };
