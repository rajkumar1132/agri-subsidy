// ============================================================
// Verification Controller — CRITICAL BUSINESS LOGIC
// Only verified rentals can proceed to subsidy application
// ============================================================
const prisma = require('../config/db');

async function getPendingVerifications(req, res) {
  try {
    const rentals = await prisma.rental.findMany({
      where: { status: 'COMPLETED', verified: false },
      include: {
        farmer: { include: { user: { select: { name: true, contact_no: true, address: true } } } },
        equipment: { select: { name: true, type: true, rental_rate: true, owner: { include: { user: { select: { name: true } } } } } },
      },
      orderBy: { updated_at: 'asc' },
    });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function verifyRental(req, res) {
  try {
    const rentalId = parseInt(req.params.id);
    const rental = await prisma.rental.findUnique({ where: { rental_id: rentalId } });

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found.' });
    }
    if (rental.status !== 'COMPLETED') {
      return res.status(400).json({
        error: `Rental must be COMPLETED before verification. Current status: ${rental.status}`,
      });
    }
    if (rental.verified) {
      return res.status(400).json({ error: 'Rental is already verified.' });
    }

    await prisma.$transaction([
      prisma.rental.update({
        where: { rental_id: rentalId },
        data: { verified: true, status: 'VERIFIED' },
      }),
      prisma.auditLog.create({
        data: {
          user_id: req.user.userId,
          action: 'RENTAL_VERIFIED',
          entity_type: 'RENTAL',
          entity_id: rentalId,
          details: `Verifier ${req.user.name} confirmed equipment usage for rental #${rentalId}`,
        },
      }),
    ]);

    res.json({
      success: true,
      message: `Rental #${rentalId} has been verified. Farmer can now apply for subsidy.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getVerificationHistory(req, res) {
  try {
    const verified = await prisma.rental.findMany({
      where: { verified: true },
      include: {
        farmer: { include: { user: { select: { name: true } } } },
        equipment: { select: { name: true, type: true } },
      },
      orderBy: { updated_at: 'desc' },
      take: 100,
    });
    res.json(verified);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getPendingVerifications, verifyRental, getVerificationHistory };
