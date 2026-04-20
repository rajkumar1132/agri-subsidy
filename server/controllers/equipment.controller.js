// ============================================================
// Equipment Controller
// ============================================================
const prisma = require('../config/db');

async function getAllEquipment(req, res) {
  try {
    const { status, type, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { type: { contains: search } },
      ];
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        owner: { include: { user: { select: { name: true, contact_no: true, address: true } } } },
      },
      orderBy: { equipment_id: 'asc' },
    });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getEquipmentTypes(req, res) {
  try {
    const types = await prisma.equipment.findMany({
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' },
    });
    res.json(types.map(t => t.type));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getEquipmentById(req, res) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { equipment_id: parseInt(req.params.id) },
      include: {
        owner: { include: { user: { select: { name: true, contact_no: true, address: true } } } },
        rentals: { take: 10, orderBy: { rental_date: 'desc' }, include: { farmer: { include: { user: { select: { name: true } } } } } },
      },
    });
    if (!equipment) return res.status(404).json({ error: 'Equipment not found.' });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllEquipment, getEquipmentTypes, getEquipmentById };
