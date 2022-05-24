const express = require('express');
const router = express.Router();

const userController = require('../controllers/usercontroller.js');
const authController = require('../controllers/authcontroller.js');

/**
 * @method POST
 * @path /api/v1/users/
 * @description create user
 */
router.post(
	'/',
	authController.protect,
	authController.authorization,
	userController.createUser
);

/**
 * @method POST
 * @path /api/v1/users/info
 * @description returns all users
 */
router.post(
	'/info',
	authController.protect,
	authController.authorization,
	userController.getAllUsers
);

/**
 * @method POST
 * @path /api/v1/users/info/:id
 * @description returns one user by id
 */
router.post(
	'/info/:id',
	authController.protect,
	userController.getUser
);

/**
 * @method POST
 * @path /api/v1/users/login
 * @description returns token for user after authentication
 */
router.post('/login', authController.login);

/**
 * @method DELETE
 * @path /api/v1/users/:id
 * @description deletes user
 */
router.delete(
	'/:id',
	authController.protect,
	authController.authorization,
	userController.deleteUser
);

/**
 * @method PATCH
 * @path /api/v1/users/:id
 * @description updates users information
 */
router.patch(
	'/:id',
	authController.protect,
	authController.authorization,
	userController.updateUser
);

module.exports = router;
