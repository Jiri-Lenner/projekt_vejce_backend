const express = require('express');
const router = express.Router();

const orderController = require('../controllers/ordercontroller.js');

router
	.route('/')
	.post(express.json(), orderController.order);

router
	.route('/onlineOrder')
	.post(
		express.raw({type: 'application/json'}),
		orderController.onlineOrder
	);

module.exports = router;
