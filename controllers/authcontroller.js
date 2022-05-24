const catchAsync = require('../utils/catchasync.js');
const appError = require('../utils/apperror.js');
const User = require('../model/usermodel.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * MW: Authenticates user
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 * @description Middleware for authenticating user and returning access token
 */
exports.login = catchAsync(async (req, res, next) => {
	const {email, password} = req.body.data;
	// request
	if (!email || !password) {
		return next(
			new appError('Chyba během přihlašování', 400)
		);
	}

	// check db whether the user with specified email exists
	const user = await User.findOne({email});

	if (!user) {
		return next(
			new appError('Chyba během přihlašování', 401)
		);
	}

	// check password
	const passwordCheck = await bcrypt.compare(
		password,
		user.password
	);

	if (!passwordCheck) {
		return next(
			new appError('Chyba během přihlašování', 401)
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
		name: user.userName,
		sub: user._id,
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
		return next(
			new appError('Chyba během přihlašování', 401)
		);
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
			new appError('Chyba během přihlašování', 401)
		);
	}

	// add user data to the request and grant access
	req.user = user;
	next();
});

exports.authorization = catchAsync(
	async (req, res, next) => {
		// protect specifc routes for admin use only!!

		//TODO přepsat na switch
		if (!req.user.admin) {
			return next(
				new appError(
					'Chyba během přihlašování',
					401
				)
			);
		}
		next();
	}
);
