const Order = require('../model/ordermodel.js');
const catchAsync = require('../utils/catchasync.js');

const calculateTime = function () {
	const midnight = new Date();
	midnight.setHours(24);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);

	return midnight.getTime() - new Date().getTime();
};

const cleanModel = async function () {
	const halfHour = 1800000;

	const failedOrders = await Order.find({
		validation: false,
	});

	const filteredOrders = failedOrders.filter(item => {
		if (Date.now() - item.timeOrdered > halfHour) {
			return item;
		}
	});
	if (filteredOrders.length > 0) {
		for (const item of filteredOrders) {
			await Order.deleteOne({_id: item._id});
		}
	}
};

// it is applied at the app level
const dbcleaner = async function () {
	// calculate the first delete and add it to set timeout . . . then set interval with the next one!

	const timeTillMidnight = calculateTime();
	const day = 86400000;

	// odstaví do daný 12hodiny
	setTimeout(() => {
		//proběhne prvni cleanup

		cleanModel();
		// odstaví do dalšího dne

		setInterval(() => {
			// cleanup
			cleanModel();
		}, day);
	}, timeTillMidnight);
};

module.exports = dbcleaner;
