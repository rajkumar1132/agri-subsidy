// ============================================================
// Equipment Owner Controller
// ============================================================
const prisma = require('../config/db');

async function getMyEquipment(req, res) {
  try {
    const equipment = await prisma.equipment.findMany({
      where: { owner_id: req.user.userId },
      include: { rentals: { where: { status: { in: ['REQUESTED', 'APPROVED'] } }, take: 5, orderBy: { created_at: 'desc' } } },
      orderBy: { created_at: 'desc' },
    });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addEquipment(req, res) {
  try {
    const { name, type, rental_rate } = req.body;
    if (!name || !type || !rental_rate || rental_rate <= 0) {
      return res.status(400).json({ error: 'Name, type, and valid rental rate are required.' });
    }

    const equipment = await prisma.equipment.create({
      data: { name, type, rental_rate: parseFloat(rental_rate), status: 'AVAILABLE', owner_id: req.user.userId },
    });

    await prisma.auditLog.create({
      data: { user_id: req.user.userId, action: 'EQUIPMENT_ADDED', entity_type: 'EQUIPMENT', entity_id: equipment.equipment_id, details: `Added: ${name} (${type}) @ ₹${rental_rate}/day` },
    });

    res.status(201).json({ success: true, message: 'Equipment added.', equipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateEquipment(req, res) {
  try {
    const equipId = parseInt(req.params.id);
    const equip = await prisma.equipment.findUnique({ where: { equipment_id: equipId } });
    if (!equip || equip.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Equipment not found or not owned by you.' });
    }

    const { name, type, rental_rate } = req.body;
    const updated = await prisma.equipment.update({
      where: { equipment_id: equipId },
      data: { ...(name && { name }), ...(type && { type }), ...(rental_rate && { rental_rate: parseFloat(rental_rate) }) },
    });

    res.json({ success: true, message: 'Equipment updated.', equipment: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteEquipment(req, res) {
  try {
    const equipId = parseInt(req.params.id);
    const equip = await prisma.equipment.findUnique({ where: { equipment_id: equipId } });
    if (!equip || equip.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Equipment not found or not owned by you.' });
    }
    if (equip.status === 'IN_USE') {
      return res.status(400).json({ error: 'Cannot delete equipment that is currently in use.' });
    }

    await prisma.equipment.delete({ where: { equipment_id: equipId } });
    res.json({ success: true, message: 'Equipment deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMyRentals(req, res) {
  try {
    const rentals = await prisma.rental.findMany({
      where: { equipment: { owner_id: req.user.userId } },
      include: {
        farmer: { include: { user: { select: { name: true, contact_no: true } } } },
        equipment: { select: { name: true, type: true, rental_rate: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function approveRental(req, res) {
  try {
    const rentalId = parseInt(req.params.id);
    const rental = await prisma.rental.findUnique({
      where: { rental_id: rentalId },
      include: { equipment: true },
    });

    if (!rental) return res.status(404).json({ error: 'Rental not found.' });
    if (rental.equipment.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'This rental is not for your equipment.' });
    }
    if (rental.status !== 'REQUESTED') {
      return res.status(400).json({ error: `Rental is already ${rental.status}.` });
    }

    await prisma.$transaction([
      prisma.rental.update({ where: { rental_id: rentalId }, data: { status: 'APPROVED' } }),
      prisma.equipment.update({ where: { equipment_id: rental.equipment_id }, data: { status: 'IN_USE' } }),
      prisma.auditLog.create({
        data: { user_id: req.user.userId, action: 'RENTAL_APPROVED', entity_type: 'RENTAL', entity_id: rentalId, details: `Owner approved rental #${rentalId}` },
      }),
    ]);

    res.json({ success: true, message: `Rental #${rentalId} approved. Equipment is now In Use.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function completeRental(req, res) {
  try {
    const rentalId = parseInt(req.params.id);
    const rental = await prisma.rental.findUnique({
      where: { rental_id: rentalId },
      include: { equipment: true },
    });

    if (!rental) return res.status(404).json({ error: 'Rental not found.' });
    if (rental.equipment.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'This rental is not for your equipment.' });
    }
    if (rental.status !== 'APPROVED') {
      return res.status(400).json({ error: `Rental must be APPROVED to complete. Current: ${rental.status}` });
    }

    await prisma.$transaction([
      prisma.rental.update({ where: { rental_id: rentalId }, data: { status: 'COMPLETED' } }),
      prisma.equipment.update({ where: { equipment_id: rental.equipment_id }, data: { status: 'AVAILABLE' } }),
      prisma.auditLog.create({
        data: { user_id: req.user.userId, action: 'RENTAL_COMPLETED', entity_type: 'RENTAL', entity_id: rentalId, details: `Owner confirmed rental #${rentalId} completion` },
      }),
    ]);

    res.json({ success: true, message: `Rental #${rentalId} completed. Equipment is now Available.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getMyEquipment, addEquipment, updateEquipment, deleteEquipment, getMyRentals, approveRental, completeRental };
