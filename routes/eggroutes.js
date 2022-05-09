const express = require('express');
const router = express.Router();

const eggController = require('../controllers/eggcontroller.js');

router
	.route('/')
	.get(express.json(), eggController.getAllEggs)
	.post(express.json(), eggController.createEgg);

router
	.route('/:id')
	.get(express.json(), eggController.getEgg)
	.delete(express.json(), eggController.deleteEgg)
	.patch(express.json(), eggController.updateEgg);

module.exports = router;
