const mongoose = require('mongoose');

const eggSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Položka musí mít název'],
		unique: true,
		trim: true,
		maxlength: [
			40,
			'Název položky nesmí přesahovat 40 znaků',
		],
		minlength: [
			10,
			'Položka musí mít alespoň 10 znaků',
		],
	},
	cat: {
		type: [String],
		required: [true, 'Položka musí mít kategorii'],
	},
	description: {
		type: String,
		required: [true, 'Položka musím mít popisek'],
	},
	eggType: {
		type: [String],
		required: [
			true,
			'Položka musím mít druh vajíčka, nebo vajíčka které obsahuje',
		],
	},
	price: {
		type: Number,
		required: [true, 'Položka musí mít cenu'],
	},
	packageQuantity: {
		type: Number,
		required: [
			true,
			'Položka musí obsahovat počet v balení',
		],
	},
	frontImg: {
		type: String,
		required: [
			true,
			'Položka musí obsahovat úvodní obrázek',
		],
	},
	imgs: {
		type: [String],
		required: [
			true,
			'Položka musí obsahovat alespoň jeden obrázek pro bližší informace o položce',
		],
	},
});

const Egg = mongoose.model('Egg', eggSchema);

module.exports = Egg;
