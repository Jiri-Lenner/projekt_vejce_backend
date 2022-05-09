const appError = require('../utils/apperror.js');

const handleCastErrorDB = err => {
	const message = `Neplatná ${err.path}: ${err.value}`;
	return new appError(message, 400);
};

const handleDuplicateFieldsDB = err => {
	const errField = Object.keys(err.keyValue)[0];
	const errValue = err.keyValue[errField];

	const message = `Nalezena duplikovaná položka "${errValue}" v odstavci "${errField}". Prosím použijte jinou!`;
	return new appError(message, 400);
};

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err, res) => {
	// Operational, trusted error: send message to the client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	} else {
		// Programming or other unknown error => dont leak the err to the client
		// 1) log the err
		console.error('❌ ERROR', err);
		// 2) send message
		res.status(err.statusCode).json({
			status: 'error',
			message: 'Něco se pokazilo!',
		});
	}
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500; // 500 => internal server error
	err.status = err.status || 'error';

	if (process.env.NODE_ENV == 'development') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = {...err, name: err.name};

		if (error.name == 'CastError') {
			// wrong id
			error = handleCastErrorDB(error);
		}

		if (error.code === 11000) {
			error = handleDuplicateFieldsDB(error);
		}

		if (!error.message) {
			error.message = err.message;
		}
		sendErrorProd(error, res);
	}
};
