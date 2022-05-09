const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	client: {
		fullName: {
			type: String,
			required: [
				true,
				'Objednávka musí mít jméno klienta',
			],
		},
		email: {
			type: String,
			required: [
				true,
				'Objednávka musí mít klientův email',
			],
		},
		phone: {
			type: String,
			required: [
				true,
				'Objednávka musí mít klientovo telefonní číslo',
			],
		},
		street: {
			type: String,
			required: [
				true,
				'Objednávka musí mít informace o bydlišti klienta',
			],
		},
		town: {
			type: String,
			required: [
				true,
				'Objednávka musí mít informace o bydlišti klienta',
			],
		},
		houseAddress: {
			type: String,
			required: [
				true,
				'Objednávka musí mít informace o bydlišti klienta',
			],
		},
		message: {
			type: String,
		},
	},
	status: {
		type: Boolean,
		required: [
			true,
			'Objednávka musí mít status zda li je dokončená či ne!',
		],
	},
	validation: {
		type: Boolean,
		required: [
			true,
			'Objednávka musí mít validaci pro zjištění platnosti!',
		], // inPerson orders will be immediately validated as true and the online only after the payment was successful
	},
	paymentMethod: {
		type: String,
		required: [true, 'Objednávka musí mít typ platby!'],
	},
	orderedItems: {
		type: [Object],
		required: [
			true,
			'Objednávka musí mít objednané položky!', // cart items id
		],
	},
	price: {
		type: Number,
		required: [true, 'Objednávka musí mít cenu!'],
	},
	timeOrdered: {
		type: Number,
		required: [
			true,
			'Objednávka musí mít čas objednání!',
		],
	},
	paymentIntent: {
		type: String,
	},
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
