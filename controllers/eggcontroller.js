const catchAsync = require('../utils/catchasync.js');
const appError = require('../utils/apperror.js');
const Egg = require('../model/eggmodel.js');

// handler functions
exports.getAllEggs = catchAsync(async (req, res, next) => {
	// EXECUTE QUERY

	const eggs = await Egg.find();

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		results: eggs.length,
		data: {eggs: eggs},
	});
});

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

exports.createEgg = catchAsync(async (req, res, next) => {
	const newEgg = await Egg.create(req.body);

	res.status(201).json({
		status: 'success',
		data: {egg: newEgg},
	});
});

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
