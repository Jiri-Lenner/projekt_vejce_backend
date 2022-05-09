const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({path: './config.env'});
console.log(`MODE: ${process.env.NODE_ENV}`);

const app = require('./app.js');

const DB = process.env.DATABASE.replace(
	'<password>',
	process.env.DATABASE_PASSWORD
);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})
	.then(() =>
		console.log('✅ DB connections successfull')
	);

// start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`✅ App running on port: ${port}`);
});

// handling unhandled rejections
process.on('unhandledRejection', err => {
	console.log(
		'❌ UNHANDLED REJECTION => Shutting down...'
	);
	console.log(err.name + ' => ' + err.message);
	server.close(() => {
		process.exit(1);
	});
});
