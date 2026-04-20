// ============================================================
// Verification Routes
// ============================================================
const router = require('express').Router();
const ctrl = require('../controllers/verification.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.get('/pending', authenticate, requireRole('VERIFIER', 'ADMIN'), ctrl.getPendingVerifications);
router.post('/:id/confirm', authenticate, requireRole('VERIFIER', 'ADMIN'), ctrl.verifyRental);
router.get('/history', authenticate, requireRole('VERIFIER', 'ADMIN'), ctrl.getVerificationHistory);

module.exports = router;
