const catchAsync = require('../utils/catchasync.js');
const appError = require('../utils/apperror.js');
const User = require('../model/usermodel.js');

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
	const newUser = await User.create(req.body);

	res.status(201).json({
		status: 'success',
		data: {user: newUser},
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

/**
 * MW: Authenticates user
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 * @description Middleware for authenticating user and returning access token
 */
exports.login = catchAsync(async (req, res, next) => {});
