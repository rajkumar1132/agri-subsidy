// ============================================================
// Admin Routes
// ============================================================
const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.get('/users', authenticate, requireRole('ADMIN'), ctrl.getAllUsers);
router.get('/audit-log', authenticate, requireRole('ADMIN'), ctrl.getAuditLog);
router.delete('/users/:id', authenticate, requireRole('ADMIN'), ctrl.deleteUser);
router.post('/query', authenticate, requireRole('ADMIN'), ctrl.executeQuery);

module.exports = router;
