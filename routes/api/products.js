const { Router } = require('express');
const route = Router();
const { auth } = require('../../middleware/auth');
const { Users, Products, Library, Review, Transaction } = require('../../data/db');
const { getAllProducts, addreport } = require('../../controllers/products');
const { AddToCart, AddToLibrary, CartProducts } = require('../../controllers/userLibrary');
const { createTransaction } = require('../../controllers/user');
const Sequelize = require('sequelize');

route.post('/Buy', auth, async (req, res) => {
	console.log(req.body);
	const product = await Products.findOne({
		where: { refrenceId: req.body.refrenceId }
	});
	const lib_item = await Library.findOne({
		where: {
			[Sequelize.Op.and]: [ { userId: req.user.username }, { ProductId: product.id } ]
		}
	});
	if (req.user.Coins < product.Value) {
		res.send(false);
	} else {
		if (!lib_item) {
			const item = await AddToLibrary(req.user.username, product.id).catch((err) => {
				console.log(err);
				res.send({ error: 'internal error' + err });
			});
			console.log(item);
			req.user.Coins = req.user.Coins - product.Value;
			req.user.save();
			const user = await Users.findOne({
				where: { username: product.SellerUsername }
			});

			user.Coins = user.Coins + 0.5 * product.Value;
			user.save();

			user.Earnings = user.Earnings + 0.5 * product.Value;
			user.save();

			user.productsSold = user.productsSold + 1 ; 
			user.save();

			const trans = await createTransaction(product.id, product.Value, true, req.user.username);
			console.log(trans.TransactionId);

			const trans_for_seller = await createTransaction(product.id, 0.5 * product.Value, false, user.username);
			res.send(item);
		}
	}
});

route.post('/AddToCart', auth, async (req, res) => {
	const cart = await AddToCart(req.user.username, req.body.refrenceId);
	res.send(cart);
});

route.post('/RemoveFromCart', auth, async (req, res) => {
	const cart = await CartProducts(req.user.username);
	cart.splice(cart.indexOf(req.body.refrenceId), 1);
	req.user.Cart = cart.join(';');
	req.user.save();
	res.send(req.user.Cart);
});

route.get('/myproducts', auth, async (req, res) => {
	let pro_ref = await Library.findAll({
		where: { userId: req.user.username },
		include: { model: Products, as: 'Product' }
	}).catch((err) => {
		console.log(err);
		res.send({ error: 'internal error' });
	});

	console.log(pro_ref);

	res.send(pro_ref);
});

route.get('/', async (req, res) => {
	const products = await Products.findAll({
		attributes: [
			'refrenceId',
			'category',
			'title',
			's_title',
			'short_des',
			'Description',
			'tag',
			'Value',
			'cover_img',
			'rating'
		],
		where: { deleted: false }
	});

	res.send({ products });
});
route.get('/Name', async (req, res) => {
	const products = await Products.findAll({
		attributes: [ 'refrenceId', 'title' ]
	});

	res.send({ products });
});

route.get('/specific/:refrenceId', async (req, res) => {
	const product = await Products.findOne({
		where: { refrenceId: req.params.refrenceId },
		attributes: [
			'id',
			'refrenceId',
			'category',
			'title',
			's_title',
			'short_des',
			'rating',
			'Description',
			'tag',
			'Value',
			'cover_img',
			'sample_pro',
			'SellerUsername'
		]
	});
	res.send(product);
});

route.get('/search_item/:refId', auth, async (req, res) => {
	console.log(req.params);
	console.log(req.user);
	const product = await Library.findAll({
		where: {
			userId: req.user.username
		},
		include: { model: Products, as: 'Product' }
	}).catch((err) => {
		console.log(err);
		res.send({ error: 'internal error' });
	});

	if (product) {
		let a = true;
		product.map((e) => {
			if (e.Product.refrenceId === req.params.refId) {
				a = false;
				res.send(true);
			}
		});
		if (a) {
			res.send(false);
		}
	} else {
		res.send({ error: 'not found' });
	}
	console.log('hello');
});

route.get('/search/:name', async (req, res) => {
	var arr = [];
	console.log('aagya');

	const products = await Products.findAll({
		attributes: [
			'refrenceId',
			'category',
			'title',
			's_title',
			'short_des',
			'Description',
			'tag',
			'Value',
			'cover_img',
			'rating',
			'keywords'
		]
	});
	for (let i = 0; i < products.length; i++) {
		if (products[i].keywords.toLowerCase().indexOf(req.params.name.toLowerCase()) > -1) {
			arr.push(products[i]);
			continue;
		}
	}
	console.log('hogya');
	res.send(arr);
});

route.get('/Sold_products/:username', auth, async (req, res) => {
	const products = await Products.findAll({
		where: { SellerUsername: req.params.username }
	});
	res.send(products);
});

route.get('/Ordered_products/:username', auth, async (req, res) => {
	const product = await Transaction.findAll({
		where: {
			[Sequelize.Op.and]: [ { Debited: true }, { userId: req.params.username } ]
		},
		include: { model: Products, as: 'item' }
	});
	res.send(product);
});

route.post('/report', auth, async (req, res) => {
	const report = await addreport(req.user.username, req.body.refId);
	console.log(report + req.body.refId);
	res.send(report);
});

route.get('/reports/:refId', auth, async (req, res) => {
	const product = await Products.findOne({
		where: { refrenceId: req.params.refId }
	});
	let arr = product.reports.split(';');
	console.log(arr);
	res.send(arr);
});

route.post('/:refId', auth, async (req, res) => {
	const product = await Products.findOne({
		where: { refrenceId: req.params.refId }
	});
	product.deleted = true;
	product.save();
	res.send(true);
});

module.exports = { route };
