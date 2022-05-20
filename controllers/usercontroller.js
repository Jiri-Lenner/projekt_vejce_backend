const catchAsync = require('../utils/catchasync.js');
const appError = require('../utils/apperror.js');
const User = require('../model/usermodel.js');
const jwt = require('jsonwebtoken');

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
exports.login = catchAsync(async (req, res, next) => {
	const {email, password} = req.body;

	// request
	if (!email || !password) {
		return next(
			new appError('Chybí heslo a email', 400)
		);
	}

	// check db whether the user with specified email exists
	const user = await User.findOne({email});

	if (!user) {
		return next(
			new appError(
				'Incorrect email or password!',
				401
			)
		);
	}

	// check password
	if (user.password !== password) {
		return next(
			new appError(
				'Incorrect email or password!',
				401
			)
		);
	}

	// token content
	const payload = {
		name: user.userName,
		sub: user._id,
	};

	const secret = process.env.JWT_SECRET;
	const options = {
		expiresIn: process.env.JWT_EXPIRATION,
	};

	// sign token
	const token = jwt.sign(payload, secret, options);

	// send response with the token
	res.status(200).json({
		status: 'success',
		token,
	});
});

exports.protect = catchAsync(async (req, res, next) => {
	// Getting the token + check existence
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return next(new appError('Nejsi přihlášen!', 401));
	}

	// Verification
	const decodedPayload = await jwt.verify(
		token,
		process.env.JWT_SECRET
	);

	// Check if the user still exists
	const user = await User.findById(decodedPayload.sub);

	if (!user) {
		return next(
			new appError(
				'Uživatel přiřazený k tomuto tokenu již neexistuje!',
				401
			)
		);
	}

	// protect specifc routes for admin use only!!

	//TODO přepsat na switch
	if (
		req.route.path === '/' &&
		req.method == 'POST' &&
		!user.admin
	) {
		return next(new appError('Nejsi admin!', 401));
	} else if (
		req.route.path === '/:id' &&
		req.method == 'DELETE' &&
		!user.admin
	) {
		return next(new appError('Nejsi admin!', 401));
	} else if (
		req.route.path === '/:id' &&
		req.method == 'PATCH' &&
		!user.admin
	) {
		return next(new appError('Nejsi admin!', 401));
	}

	// add user data to the request and grant access
	req.user = user;
	next();
});
