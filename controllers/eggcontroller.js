const catchAsync = require('../utils/catchasync.js');
const appError = require('../utils/apperror.js');
const Egg = require('../model/eggmodel.js');

/**
 * @typedef { import('express').Request } Request
 * @typedef { import('express').Response } Response
 * @typedef { import('express').NextFunction } NextFunction
 */

/**
 * MW: Gets all the egg store items
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @description Middleware for returning all egg store items from database
 */
exports.getAllEggs = catchAsync(async (req, res) => {
	// EXECUTE QUERY

	const eggs = await Egg.find();

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		results: eggs.length,
		data: {eggs: eggs},
	});
});

/**
 * MW: Gets the specific egg store item
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 * @description Middleware for returning a specific egg store item by id from database
 */
exports.getEgg = catchAsync(async (req, res, next) => {
	const egg = await Egg.findById(req.params.id);

	if (!egg) {
		return next(
			new appError(
				'Položka pro specifikované ID nebyla nalezena',
				404
			)
		);
	}

	res.status(200).json({
		status: 'success',
		data: {egg: egg},
	});
});

/**
 * MW: Creates new egg store items
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @description Middleware for creating new egg store items and adding them into database
 */
exports.createEgg = catchAsync(async (req, res) => {
	const newEgg = await Egg.create(req.body);

	res.status(201).json({
		status: 'success',
		data: {egg: newEgg},
	});
});

/**
 * MW: Updates egg store items
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 * @description Middleware for updating egg store items that are already in database
 */
exports.updateEgg = catchAsync(async (req, res, next) => {
	const egg = await Egg.findByIdAndUpdate(
		req.params.id,
		req.body,
		{new: true, runValidators: true}
	);

	if (!egg) {
		return next(
			new appError(
				'Položka pro specifikované ID nebyla nalezena',
				404
			)
		);
	}

	res.status(200).json({
		status: 'success',
		data: {egg: egg},
	});
});

/**
 * MW: Deletes eggs store items
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 * @description Middleware for deleting egg store items from database
 */
exports.deleteEgg = catchAsync(async (req, res, next) => {
	const egg = await Egg.findByIdAndDelete(req.params.id);

	if (!egg) {
		return next(
			new appError(
				'Položka pro specifikované ID nebyla nalezena',
				404
			)
		);
	}

	res.status(204).json({
		status: 'success',
		data: null,
	});
});
