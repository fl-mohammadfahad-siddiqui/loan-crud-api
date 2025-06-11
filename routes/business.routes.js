const express = require('express');
const router = express.Router();
const businessController = require('../controllers/business.controller');

router.get('/', businessController.getAllBusiness);
router.get('/:id', businessController.getBusinessById);
router.post('/', businessController.createBusiness);
router.put('/:id', businessController.updateBusiness);
router.delete('/:id', businessController.deleteBusiness);

module.exports = router;
