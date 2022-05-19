const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController.js');

router
	.route('/')
	.post(express.json(), userController.createUser);

router
	.route('/login')
	.post(express.json(), userController.loginUser);

router
	.route('/:id')
	.post(express.json(), userController.getUser)
	.delete(express.json(), userController.deleteUser)
	.patch(express.json(), userController.updateUser);

module.exports = router;
