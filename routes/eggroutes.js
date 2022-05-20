const express = require('express');
const router = express.Router();

const eggController = require('../controllers/eggcontroller.js');

/**
 * @method GET
 * @path /api/v1/eggs
 * @description returns all eggs store items
 */
router.get('/', eggController.getAllEggs);

/**
 * @method POST
 * @path /api/v1/eggs
 * @description creates new egg store item
 */
router.post('/', eggController.createEgg);

/**
 * @method GET
 * @path /api/v1/eggs/:id
 * @description returns specific store item
 */
router.get('/:id', eggController.getEgg);

/**
 * @method DELETE
 * @path /api/v1/eggs/:ids
 * @description deletes specific store item
 */
router.delete('/:id', eggController.deleteEgg);

/**
 * @method PATCH
 * @path /api/v1/eggs/:id
 * @description updates specific store item
 */
router.patch('/:id', eggController.updateEgg);

module.exports = router;
