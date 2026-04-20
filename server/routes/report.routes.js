// ============================================================
// Report Routes
// ============================================================
const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.get('/dashboard', authenticate, ctrl.getDashboardStats);
router.get('/rental-history', authenticate, ctrl.getRentalHistory);
router.get('/subsidy-distribution', authenticate, requireRole('ADMIN', 'PROGRAM_OFFICER'), ctrl.getSubsidyDistribution);
router.get('/fraud-alerts', authenticate, requireRole('ADMIN', 'PROGRAM_OFFICER'), ctrl.getFraudAlerts);
router.get('/monthly-trends', authenticate, requireRole('ADMIN', 'PROGRAM_OFFICER'), ctrl.getMonthlyTrends);

module.exports = router;
