// ============================================================
// Rental Routes
// ============================================================
const router = require('express').Router();
const ctrl = require('../controllers/rental.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.get('/', authenticate, ctrl.getAllRentals);
router.post('/book', authenticate, requireRole('FARMER'), ctrl.bookEquipment);
router.get('/:id', authenticate, ctrl.getRentalById);

module.exports = router;
