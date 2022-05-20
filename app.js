const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const history = require('connect-history-api-fallback');
const path = require('path');

const appError = require('./utils/apperror.js');
const globalErrorHandler = require('./controllers/errorcontroller.js');

const eggRouter = require('./routes/eggroutes.js');
const orderRouter = require('./routes/orderroutes.js');
const userRouter = require('./routes/userroutes.js');

const dbcleaner = require('./model/dbcleaner');

const app = express();

// dev
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

app.use(cors());

/// body parser
//app.use(express.json());

const staticPublic = express.static(
	path.join(__dirname + '/public')
);

const staticDist = express.static(
	path.join(__dirname + '/public/dist')
);

// /// static file reader
app.use('/public', staticPublic);

// router mounting
app.use('/api/v1/eggs', express.json(), eggRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', express.json(), userRouter);

app.use(staticDist); // pokud to neni ani jeden ze zminenych tak se na vsechny ostatni aplikuje tohle
app.use(
	history({
		disableDotRule: true,
		verbose: true,
	})
);
app.use(staticDist);

app.get('/', function (req, res) {
	res.render(`${__dirname}/public/dist/index.html`);
});

app.all('*', (req, res, next) => {
	next(
		new appError(
			`Nic nebylo nalezeno na adrese ${req.originalUrl} na tomto servru!`,
			404
		)
	);
});

app.use(globalErrorHandler);

dbcleaner();

module.exports = app;
