// ============================================================
// Equipment Owner Routes
// ============================================================
const router = require('express').Router();
const ctrl = require('../controllers/owner.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.get('/equipment', authenticate, requireRole('EQUIPMENT_OWNER'), ctrl.getMyEquipment);
router.post('/equipment', authenticate, requireRole('EQUIPMENT_OWNER'), ctrl.addEquipment);
router.put('/equipment/:id', authenticate, requireRole('EQUIPMENT_OWNER'), ctrl.updateEquipment);
router.delete('/equipment/:id', authenticate, requireRole('EQUIPMENT_OWNER'), ctrl.deleteEquipment);
router.get('/rentals', authenticate, requireRole('EQUIPMENT_OWNER'), ctrl.getMyRentals);
router.post('/rentals/:id/approve', authenticate, requireRole('EQUIPMENT_OWNER'), ctrl.approveRental);
router.post('/rentals/:id/complete', authenticate, requireRole('EQUIPMENT_OWNER'), ctrl.completeRental);

module.exports = router;
