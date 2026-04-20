// ============================================================
// Farmer Routes
// ============================================================
const router = require('express').Router();
const ctrl = require('../controllers/farmer.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.get('/', authenticate, ctrl.getAllFarmers);
router.get('/:id', authenticate, ctrl.getFarmerById);
router.get('/:id/rentals', authenticate, ctrl.getFarmerRentals);
router.get('/:id/subsidies', authenticate, ctrl.getFarmerSubsidies);
router.put('/profile', authenticate, requireRole('FARMER'), ctrl.updateProfile);

module.exports = router;
