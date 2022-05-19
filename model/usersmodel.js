const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	userName: {
		type: String,
		required: [true, 'Uživatel musí mít jméno'],
	},
	email: {
		type: String,
		required: [true, 'Uživatel musí mít email'],
		unique: true,
	},
	password: {
		type: String,
		required: [true, 'Uživatel musí mít heslo'],
	},
	role: {
		type: Number,
		required: [true, 'Uživatel musí mít pravomoce'],
	},
});

const User = mongoose.model('User', userSchema);
module.exports = User;
