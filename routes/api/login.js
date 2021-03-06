const { Router } = require('express');
const route = Router();
const { findUser } = require('../../controllers/user');
const { auth } = require('../../middleware/auth');
const { adminAuth } = require('../../middleware/adminAuth');
const { Users } = require('../../data/db');

// for login request
route.post('/', async (req, res) => {
	if (req.body.user) {
		let cuser = req.body.user;

		let ouser = await findUser(cuser.username, cuser.password);

		if (ouser) {
			if (ouser.password === cuser.password) {
				req.session.token = ouser.token;
				req.session.save();

				res.send({ username: ouser.username });
			} else {
				res.send({ error: 'Incorrect Password' });
			}
		} else {
			res.send({ error: 'Username not found' });
		}
	} else {
		res.send({ 'error ': 'internal error' });
	}
});

route.delete('/out', auth, async (req, res) => {
	req.session.token = null;
	req.session.save();
	if (!req.session.token) {
		res.send('logout succesfull');
	}
});

route.get('/', auth, (req, res) => {
	let user = req.user;
	let senduser = {
		user: {
			username: user.username,
			name: user.f_name,
			email: user.email,
			phone_Number: user.phone_Number,
			Address: user.Address,
			Verified: user.Verified,
			pro_img: user.pro_img
		}
	};
	res.send(senduser);
});

route.delete('/', auth, (req, res) => {
	req.session.token = null;
	req.session.save();

	res.redirect('/home');
});

route.get('/isAdmin', adminAuth, async (req, res) => {
	res.send(true);
});

module.exports = { route };
