const catchAsync = require('../utils/catchasync.js');
const appError = require('../utils/apperror.js');
const User = require('../model/usermodel.js');
const bcrypt = require('bcryptjs');

/**
 * @typedef { import('express').Request } Request
 * @typedef { import('express').Response } Response
 * @typedef { import('express').NextFunction } NextFunction
 */

/**
 * MW: Gets users from database
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @description Middleware for getting all users from database
 */
exports.getAllUsers = catchAsync(async (req, res) => {
	const users = await User.find();

	res.status(200).json({
		status: 'success',
		data: {users: users},
	});
});

/**
 * MW: Gets user from database
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 * @description Middleware for getting one user from database by id
 */
exports.getUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(
			new appError(
				'Uživatel pro specifikované ID nebyl nalezena',
				404
			)
		);
	}

	user.password = undefined;

	res.status(200).json({
		status: 'success',
		data: {user: user},
	});
});

/**
 * MW: Creates user in database
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @description Middleware for creating users and adding them to database
 */
exports.createUser = catchAsync(async (req, res) => {
	// hash the password

	const newUser = req.body;

	const salt = await bcrypt.genSalt(
		Number(process.env.BCRYPT_SALT_ROUNDS)
	);

	newUser.password = await bcrypt.hash(
		newUser.password,
		salt
	);

	const createdUser = await User.create(newUser);

	console.log(newUser.password);

	res.status(201).json({
		status: 'success',
		data: {user: createdUser},
	});
});

/**
 * MW: Updates user in database
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 * @description Middleware for updating users data in database
 */
exports.updateUser = catchAsync(async (req, res, next) => {
	// if it includes password => hash the password
	if (req.body.password) {
		const salt = await bcrypt.genSalt(
			Number(process.env.BCRYPT_SALT_ROUNDS)
		);

		req.body.password = await bcrypt.hash(
			req.body.password,
			salt
		);
	}

	const user = await User.findByIdAndUpdate(
		req.params.id,
		req.body,
		{new: true, runValidators: true}
	);

	if (!user) {
		return next(
			new appError(
				'Uživatel pro specifikované ID nebyl nalezena',
				404
			)
		);
	}

	res.status(200).json({
		status: 'success',
		data: {user: user},
	});
});

/**
 * MW: Deletes user in database
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 * @description Middleware for deleteng users in database
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndDelete(
		req.params.id
	);

	if (!user) {
		return next(
			new appError(
				'Uživatel pro specifikované ID nebyl nalezena',
				404
			)
		);
	}

	res.status(204).json({
		status: 'success',
		data: null,
	});
});
