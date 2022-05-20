const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController.js');

/**
 * @method POST
 * @path /api/v1/users/
 * @description create user
 */
router.post('/', userController.createUser);

/**
 * @method POST
 * @path /api/v1/users/info
 * @description returns all users
 */
router.post('/info', userController.getAllUsers);

/**
 * @method POST
 * @path /api/v1/users/info/:id
 * @description returns one user by id
 */
router.post('/info/:id', userController.getUser);

/**
 * @method POST
 * @path /api/v1/users/login
 * @description returns token for user after authentication
 */
router.post('/login', userController.login);

/**
 * @method DELETE
 * @path /api/v1/users/:id
 * @description deletes user
 */
router.delete('/:id', userController.deleteUser);

/**
 * @method PATCH
 * @path /api/v1/users/:id
 * @description updates users information
 */
router.patch('/:id', userController.updateUser);

module.exports = router;
