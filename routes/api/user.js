const { Users, Products, Library } = require('../../data/db');
const { Router } = require('express');
route = Router();
const { auth } = require('../../middleware/auth');
const { adminAuth } = require('../../middleware/adminAuth');
const { CartProducts, AddToLibrary } = require('../../controllers/userLibrary');
const Sequelize = require('sequelize');

route.get('/', auth, async (req, res) => {
	const user = await Users.findOne({
		
		where: { username: req.user.username }
	});

	res.send(user);
});

route.get('/Cart', auth, async (req, res) => {
	var products = [];
	const cart = await CartProducts(req.user.username);
	for (let i = 0; i < cart.length; i++) {
		let item = await Products.findOne({
			attributes: [
				'id',
				'refrenceId',
				'category',
				'title',
				's_title',
				'short_des',
				'Description',
				'cover_img',
				'tag',
				'rating'
			],
			where: { refrenceId: cart[i] }
		});
		if (item != null) {
			products.push(item);
		}
	}
	console.log(products.length);
	res.send(products);
});

route.get('/CartRefID', auth, async (req, res) => {
	if (req.user) {
		let arr = [];
		if (req.user.Cart != null) {
			arr = req.user.Cart.split(';');
		}
		res.send(arr);
	} else {
		res.send({ error: 'internal cardRefId error' });
	}
});

route.get('/Library', auth, async (req, res) => {
	var items = [];
	const item = await Library.findAll({
		where: { username: req.user.username }
	});
	console.log(item[0].Product_RefrenceId);
	for (let i = 0; i < item.length; i++) {
		let prdct = await Products.findOne({
			attributes: [
				'id',
				'refrenceId',
				'category',
				'title',
				's_title',
				'short_des',
				'Description',
				'old',
			],
			where: { refrenceId: item[i].Product_RefrenceId }
		});
		items.push(prdct);
	}

	res.send(items);
});

route.put('/', auth, (req, res) => {
	const a = req.body;
	if (a.username) {
		req.user.username = 'nimi';
		console.log(req.user.username);
		req.user.save();
		console.log(a.username);
	}
	if (a.email) {
		req.user.email = a.email;
		req.user.save();
	}
	if(a.name){
		req.user.name = a.name;
		req.user.save();
	}
	if (a.phone_Number) {
		req.user.phone_Number = a.phone_Number;
		req.user.save();
	}
	if (a.Address) {
		req.user.Address = a.Address;
		req.user.save();
	}
	if(a.bio){
		req.user.bio = a.bio
		req.user.save();
	}
	if(a.College){
		req.user.College = a.College
		req.user.save();
	}
	if(a.Qualification){
		req.user.Qualification = a.Qualification
		req.user.save();
	}

	res.send(req.user);
});



route.get('/products', auth, async (req, res) => {
	const products = await Products.findAll({
		where: { SellerUsername: req.user.username }
	});
	console.log('hogybhaiyaa');
	res.send(products);
});



route.get('/getUser/:username', async (req, res) => {
	const user = await Users.findOne({
		where: { username: req.params.username }
	});
	res.send(user);
});

route.get('/getAll', adminAuth, async (req, res) => {
	const users = await Users.findAll();
	res.send(users);
});

route.post('/report', auth, async (req, res) => {
	const report = await addreport(req.user.username, req.body.username);
	res.send(report);
});

route.get('/reports/:username', async (req, res) => {
	const user = await Users.findOne({
		where: { username: req.params.username }
	});
	let arr = user.reports.split(';');
	console.log(arr + req.params.username);
	res.send(arr);
});

route.delete('/:username', auth, async (req, res) => {
	const user = await Users.findOne({
		where: { username: req.params.username }
	});
	console.log(user.email);
	user.destroy();
});





module.exports = { route };
