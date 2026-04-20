// ============================================================
// Equipment Routes (Public listing + filtering)
// ============================================================
const router = require('express').Router();
const ctrl = require('../controllers/equipment.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getAllEquipment);
router.get('/types', authenticate, ctrl.getEquipmentTypes);
router.get('/:id', authenticate, ctrl.getEquipmentById);

module.exports = router;
