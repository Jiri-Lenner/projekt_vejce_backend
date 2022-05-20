const appError = require('../utils/apperror.js');
const catchAsync = require('../utils/catchasync.js');
const Egg = require('../model/eggmodel.js');
const Order = require('../model/ordermodel.js');

const nodemailer = require('nodemailer');
const stripe = require('stripe')(
	process.env.STRIPE_PRIVATE_KEY
);

const transporter = nodemailer.createTransport({
	host: 'smtp.seznam.cz',
	port: 465,
	secure: true,
	auth: {
		user: process.env.ARTIST_MAIL,
		pass: process.env.ARTIST_MAIL_PASSWORD,
	},
	send: true,
	preview: false,
});

/**
 * @typedef { import('express').Request } Request
 * @typedef { import('express').Response } Response
 * @typedef { import('express').NextFunction } NextFunction
 */

/**
 * MW: Confirms online payment
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 * @description Middleware for handling confirmation of online payment from stripe
 */
exports.onlineOrder = catchAsync(async (req, res, next) => {
	const endpointSecret =
		process.env.STRIPE_ENDPOINT_SECRET;

	const sig = req.headers['stripe-signature'];

	let event;

	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			endpointSecret
		);
	} catch (err) {
		return next(new appError('Error webhooku', 400));
	}

	// Handle the event
	let charge;
	switch (event.type) {
		case 'charge.failed':
			charge = event.data.object;
			// Then define and call a function to handle the event charge.failed

			break;
		case 'charge.succeeded':
			charge = event.data.object;

			const data = await Order.findOneAndUpdate(
				{paymentIntent: charge.payment_intent},
				{validation: true},
				{
					new: true,
					runValidators: true,
				}
			);

			// send mail with defined transport object
			await transporter
				.sendMail({
					from: '"Vlastimila Lennerová" <kraslice.lennerova@seznam.cz>',
					to: data.client.email,
					subject: 'Objednávka odeslána! 🎉',
					html: `<b>Tvoje objednávka za ${data.price} byla odeslána!🔥<br/>Děkujeme za nákup!❤️<br/>Vše doručíme co nejdříve!🚀<br/>S pozdravem Vlastička!</b>`,
				})
				.catch(() => {
					return next(
						new appError(
							'Došlo k chybě během odesílání objednávky, ujistěte se že jste zadali validní údaje',
							404
						)
					);
				});

			await transporter
				.sendMail({
					from: '"Vlastimila Lennerová" <kraslice.lennerova@seznam.cz>',
					to: 'kraslice.lennerova@seznam.cz',
					subject: 'Objednávka',
					html: `<b>Nová objednávka</b>`,
				})
				.catch(() => {
					return next(
						new appError(
							'Došlo k chybě během odesílání objednávky, ujistěte se že jste zadali validní údaje',
							404
						)
					);
				});

			break;
		default:
		// other event types
	}
	res.status(200).send();
});

/**
 * MW: Order hanler
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 * @description Middleware for creating orders (for both payment types)
 */
exports.order = catchAsync(async (req, res, next) => {
	const data = req.body.data;
	if (!data) {
		return next(
			new appError('Obsah objednávky je prázdný', 404)
		);
	} else if (
		!data.fullName ||
		!data.email ||
		!data.phone ||
		!data.street ||
		!data.town ||
		!data.houseAddress ||
		!data.paymentMethod ||
		!data.cart
	) {
		return next(
			new appError(
				'Jedna z položek objednávky je prázdná',
				404
			)
		);
	} else if (data.cart.length == 0) {
		return next(new appError('Košík je prázdný', 404));
	}

	if (data.paymentMethod === 'inPerson') {
		const cartItems = await Egg.find()
			.where('_id')
			.in(data.cart.map(item => item._id));

		let overallPrice = 0;
		for (const item of data.cart) {
			const foundData = cartItems.find(
				property => property._id == item._id
			);
			overallPrice += foundData.price * item.quantity;
		}

		overallPrice += 50;

		// save data
		await Order.create({
			client: {
				fullName: data.fullName,
				email: data.email,
				phone: data.phone,
				street: data.street,
				town: data.town,
				houseAddress: data.houseAddress,
				message: data.message,
			},
			status: false,
			validation: true,
			paymentMethod: 'inPerson',
			orderedItems: data.cart,
			price: overallPrice, // Dopočítat!!
			timeOrdered: new Date().getTime(), // podivat jak funguje time v js
		});

		// send mail with defined transport object
		await transporter
			.sendMail({
				from: '"Vlastimila Lennerová" <kraslice.lennerova@seznam.cz>',
				to: data.email,
				subject: 'Objednávka odeslána! 🎉',
				html: `<b>Tvoje objednávka za ${overallPrice}Kč kraslic byla odeslána!🔥<br/>Děkujeme za nákup!❤️<br/>Vše doručíme co nejdříve!🚀<br/>S pozdravem Vlastička!</b>`,
			})
			.catch(() => {
				return next(
					new appError(
						'Došlo k chybě během odesílání objednávky, ujistěte se že jste zadali validní údaje',
						404
					)
				);
			});

		await transporter
			.sendMail({
				from: '"Vlastimila Lennerová" <kraslice.lennerova@seznam.cz>',
				to: 'kraslice.lennerova@seznam.cz',
				subject: 'Objednávka',
				html: `<b>Nová objednávka</b>`,
			})
			.catch(() => {
				return next(
					new appError(
						'Došlo k chybě během odesílání objednávky, ujistěte se že jste zadali validní údaje',
						404
					)
				);
			});

		res.status(200).json({
			status: 'success',
			data: 'Order confirmed',
		});
	} else if (data.paymentMethod === 'online') {
		const cartItems = await Egg.find()
			.where('_id')
			.in(data.cart.map(item => item._id));

		const items = cartItems.map(item => {
			return {
				price_data: {
					currency: 'czk',
					product_data: {
						name: item.name,
					},
					unit_amount: item.price * 100,
				},
				quantity: data.cart.find(
					cartItem => cartItem._id == item._id
				).quantity,
			};
		});

		items.push({
			price_data: {
				currency: 'czk',
				product_data: {
					name: 'Doprava',
				},
				unit_amount: 5000,
			},
			quantity: 1,
		});

		// prepare session
		const session = await stripe.checkout.sessions
			.create({
				payment_method_types: ['card'],
				mode: 'payment',
				success_url: `https://kraslicelennerova.cz/kosik/formular/odeslano`,

				//success_url: `${process.env.SERVER_URL}`,
				cancel_url: `https://kraslicelennerova.cz/kosik/formular/error`,
				//cancel_url: `${process.env.SERVER_URL}`,
				line_items: items,
			})
			.catch(err => {
				console.log(err);
				return next(
					new appError(
						'Došlo k chybě během odesílání objednávky, ujistěte se že jste zadali validní údaje',
						404
					)
				);
			});

		let overallPrice = 0;
		for (const property of items) {
			overallPrice +=
				(property.price_data.unit_amount / 100) *
				property.quantity;
		}

		// save data
		await Order.create({
			client: {
				fullName: data.fullName,
				email: data.email,
				phone: data.phone,
				street: data.street,
				town: data.town,
				houseAddress: data.houseAddress,
				message: data.message,
			},
			status: false,
			validation: false,
			paymentMethod: 'Online',
			orderedItems: data.cart,
			price: overallPrice, // Dopočítat!!
			timeOrdered: new Date().getTime(),
			paymentIntent: session.payment_intent,
		});

		// Handle successful payment here
		res.status(200).json({
			status: 'success',
			data: {
				sessionUrl: session,
			},
		});

		// check for errors and make appropiate responses
	} else {
		return next(
			new appError('Zadán špatný způsob platby', 404)
		);
	}
});
