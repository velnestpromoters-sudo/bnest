const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/tenant/my-interactions', protect, interactionController.getTenantInteractions);
router.get('/owner/all', protect, interactionController.getAllOwnerInteractions);
router.get('/owner/property/:propertyId', protect, interactionController.getPropertyInteractions);
router.get('/:id', protect, interactionController.getInteractionById);
router.put('/:id/stage', protect, interactionController.updateInteractionStage);

module.exports = router;
