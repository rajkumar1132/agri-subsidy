// ============================================================
// Rental Controller — Equipment Booking System
// ============================================================
const prisma = require('../config/db');

async function getAllRentals(req, res) {
  try {
    const { status, farmer_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (farmer_id) where.farmer_id = parseInt(farmer_id);

    // If farmer, show only own rentals
    if (req.user.userType === 'FARMER') {
      where.farmer_id = req.user.userId;
    }

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        farmer: { include: { user: { select: { name: true, contact_no: true } } } },
        equipment: { select: { name: true, type: true, rental_rate: true, owner: { include: { user: { select: { name: true } } } } } },
        subsidyApplication: { select: { application_id: true, approval_status: true, subsidy_amount: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function bookEquipment(req, res) {
  try {
    const { equipment_id, duration } = req.body;
    const farmerId = req.user.userId;

    if (!equipment_id || !duration || duration <= 0) {
      return res.status(400).json({ error: 'Equipment ID and valid duration (days) are required.' });
    }

    // Validate farmer exists
    const farmer = await prisma.farmer.findUnique({ where: { user_id: farmerId } });
    if (!farmer) {
      return res.status(400).json({ error: 'Farmer profile not found.' });
    }

    // Check equipment availability
    const equipment = await prisma.equipment.findUnique({ where: { equipment_id: parseInt(equipment_id) } });
    if (!equipment) {
      return res.status(400).json({ error: 'Equipment not found.' });
    }
    if (equipment.status === 'IN_USE') {
      return res.status(400).json({ error: `Equipment "${equipment.name}" is currently in use.` });
    }

    // Calculate total
    const totalAmount = equipment.rental_rate * parseInt(duration);

    const rental = await prisma.$transaction(async (tx) => {
      const newRental = await tx.rental.create({
        data: {
          farmer_id: farmerId,
          equipment_id: parseInt(equipment_id),
          duration: parseInt(duration),
          total_amount: totalAmount,
          status: 'REQUESTED',
          verified: false,
        },
      });

      await tx.auditLog.create({
        data: {
          user_id: farmerId,
          action: 'RENTAL_REQUESTED',
          entity_type: 'RENTAL',
          entity_id: newRental.rental_id,
          details: `Farmer booked ${equipment.name} for ${duration} days @ ₹${totalAmount}`,
        },
      });

      return newRental;
    });

    res.status(201).json({
      success: true,
      message: `Rental request #${rental.rental_id} created for "${equipment.name}". Awaiting owner approval.`,
      rental,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRentalById(req, res) {
  try {
    const rental = await prisma.rental.findUnique({
      where: { rental_id: parseInt(req.params.id) },
      include: {
        farmer: { include: { user: { select: { name: true, contact_no: true, address: true } } } },
        equipment: { include: { owner: { include: { user: { select: { name: true } } } } } },
        subsidyApplication: true,
      },
    });
    if (!rental) return res.status(404).json({ error: 'Rental not found.' });
    res.json(rental);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllRentals, bookEquipment, getRentalById };
