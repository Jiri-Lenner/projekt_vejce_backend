const express = require('express');
const router = express.Router();

const orderController = require('../controllers/ordercontroller.js');

/**
 * @method POST
 * @path /api/v1/orders
 * @description creates an order (payed in person of online) and adds it to the database
 */
router.post('/', express.json(), orderController.order);

/**
 * @method POST
 * @path /api/v1/orders/onlineOrder
 * @description confirms online payed order
 */
router.post(
	'/onlineOrder',
	express.raw({type: 'application/json'}),
	orderController.onlineOrder
);

module.exports = router;
