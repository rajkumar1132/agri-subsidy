// ============================================================
// Farmer Controller
// ============================================================
const prisma = require('../config/db');

async function getAllFarmers(req, res) {
  try {
    const farmers = await prisma.farmer.findMany({
      include: {
        user: {
          select: { user_id: true, name: true, contact_no: true, address: true, email: true, created_at: true },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getFarmerById(req, res) {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { user_id: parseInt(req.params.id) },
      include: {
        user: { select: { user_id: true, name: true, contact_no: true, address: true, email: true } },
      },
    });
    if (!farmer) return res.status(404).json({ error: 'Farmer not found.' });
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getFarmerRentals(req, res) {
  try {
    const farmerId = parseInt(req.params.id);
    const rentals = await prisma.rental.findMany({
      where: { farmer_id: farmerId },
      include: {
        equipment: { select: { name: true, type: true, rental_rate: true, owner: { include: { user: { select: { name: true } } } } } },
      },
      orderBy: { rental_date: 'desc' },
    });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getFarmerSubsidies(req, res) {
  try {
    const farmerId = parseInt(req.params.id);
    const subsidies = await prisma.subsidyApplication.findMany({
      where: { rental: { farmer_id: farmerId } },
      include: {
        rental: {
          include: {
            equipment: { select: { name: true, type: true } },
          },
        },
      },
      orderBy: { application_date: 'desc' },
    });
    res.json(subsidies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { contact_no, address } = req.body;
    await prisma.user.update({
      where: { user_id: req.user.userId },
      data: { contact_no, address },
    });
    res.json({ success: true, message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllFarmers, getFarmerById, getFarmerRentals, getFarmerSubsidies, updateProfile };
