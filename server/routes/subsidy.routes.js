// ============================================================
// Subsidy Routes
// ============================================================
const router = require('express').Router();
const ctrl = require('../controllers/subsidy.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.get('/', authenticate, ctrl.getAllSubsidies);
router.post('/apply', authenticate, requireRole('FARMER'), ctrl.applyForSubsidy);
router.get('/calculate/:rentalId', authenticate, ctrl.calculateSubsidy);
router.post('/:id/approve', authenticate, requireRole('PROGRAM_OFFICER', 'ADMIN'), ctrl.approveSubsidy);
router.post('/:id/reject', authenticate, requireRole('PROGRAM_OFFICER', 'ADMIN'), ctrl.rejectSubsidy);

module.exports = router;
