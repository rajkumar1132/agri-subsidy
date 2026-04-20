// ============================================================
// Subsidy Controller — CORE FEATURE with Fraud Prevention
// ============================================================
const prisma = require('../config/db');

// ── Helper: Calculate subsidy based on farmer category ──────
function computeSubsidyAmount(totalAmount, landArea) {
  let pct;
  if (landArea < 5) pct = 0.50;       // Small farmer — 50%
  else if (landArea <= 15) pct = 0.35; // Medium farmer — 35%
  else pct = 0.20;                     // Large farmer — 20%
  return Math.round(totalAmount * pct * 100) / 100;
}

function getFarmerCategory(landArea) {
  if (landArea < 5) return 'Small Farmer (50% subsidy)';
  if (landArea <= 15) return 'Medium Farmer (35% subsidy)';
  return 'Large Farmer (20% subsidy)';
}

// ── Get All Subsidies ───────────────────────────────────────
async function getAllSubsidies(req, res) {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.approval_status = status;

    // Farmers see only their own
    if (req.user.userType === 'FARMER') {
      where.rental = { farmer_id: req.user.userId };
    }

    const subsidies = await prisma.subsidyApplication.findMany({
      where,
      include: {
        rental: {
          include: {
            farmer: { include: { user: { select: { name: true, contact_no: true } } } },
            equipment: { select: { name: true, type: true } },
          },
        },
        officer: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(subsidies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Apply for Subsidy (with fraud prevention) ───────────────
async function applyForSubsidy(req, res) {
  try {
    const { rental_id } = req.body;
    const farmerId = req.user.userId;

    if (!rental_id) {
      return res.status(400).json({ error: 'Rental ID is required.' });
    }

    // 1. Check rental exists
    const rental = await prisma.rental.findUnique({
      where: { rental_id: parseInt(rental_id) },
      include: { farmer: true },
    });

    if (!rental) {
      return res.status(400).json({
        error: `Rental #${rental_id} does not exist.`,
        fraud_alert: false,
      });
    }

    // 2. FRAUD CHECK: Rental belongs to this farmer
    if (rental.farmer_id !== farmerId) {
      await prisma.auditLog.create({
        data: {
          user_id: farmerId,
          action: 'FRAUD_ATTEMPT',
          entity_type: 'SUBSIDY',
          entity_id: parseInt(rental_id),
          details: `⚠️ Farmer #${farmerId} tried to claim subsidy for rental #${rental_id} belonging to farmer #${rental.farmer_id}`,
        },
      });
      return res.status(403).json({
        error: 'FRAUD ALERT: This rental does not belong to you.',
        fraud_alert: true,
      });
    }

    // 3. Check rental is VERIFIED
    if (rental.status !== 'VERIFIED' || !rental.verified) {
      return res.status(400).json({
        error: `Rental must be VERIFIED before applying for subsidy. Current status: ${rental.status}, Verified: ${rental.verified}`,
        fraud_alert: false,
      });
    }

    // 4. FRAUD CHECK: Duplicate subsidy prevention
    const existingSubsidy = await prisma.subsidyApplication.findUnique({
      where: { rental_id: parseInt(rental_id) },
    });
    if (existingSubsidy) {
      await prisma.auditLog.create({
        data: {
          user_id: farmerId,
          action: 'DUPLICATE_SUBSIDY_ATTEMPT',
          entity_type: 'SUBSIDY',
          entity_id: parseInt(rental_id),
          details: `⚠️ Duplicate subsidy attempt for rental #${rental_id}. Existing application: #${existingSubsidy.application_id}`,
        },
      });
      return res.status(400).json({
        error: `FRAUD ALERT: A subsidy application already exists for rental #${rental_id}.`,
        fraud_alert: true,
      });
    }

    // 5. Calculate subsidy amount
    const subsidyAmount = computeSubsidyAmount(rental.total_amount, rental.farmer.land_area);

    // 6. Create application
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.subsidyApplication.create({
        data: {
          rental_id: parseInt(rental_id),
          subsidy_amount: subsidyAmount,
          approval_status: 'PENDING',
        },
      });

      await tx.auditLog.create({
        data: {
          user_id: farmerId,
          action: 'SUBSIDY_APPLIED',
          entity_type: 'SUBSIDY_APPLICATION',
          entity_id: app.application_id,
          details: `Subsidy ₹${subsidyAmount} applied for rental #${rental_id} (${getFarmerCategory(rental.farmer.land_area)})`,
        },
      });

      return app;
    });

    res.status(201).json({
      success: true,
      message: `Subsidy application #${application.application_id} created for ₹${subsidyAmount.toLocaleString()}.`,
      application,
      category: getFarmerCategory(rental.farmer.land_area),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Calculate Subsidy Preview ───────────────────────────────
async function calculateSubsidy(req, res) {
  try {
    const rentalId = parseInt(req.params.rentalId);
    const rental = await prisma.rental.findUnique({
      where: { rental_id: rentalId },
      include: {
        farmer: { include: { user: { select: { name: true } } } },
        equipment: { select: { name: true, type: true } },
      },
    });

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found.' });
    }

    const subsidyAmount = computeSubsidyAmount(rental.total_amount, rental.farmer.land_area);

    res.json({
      rental_id: rentalId,
      farmer_name: rental.farmer.user.name,
      equipment_name: rental.equipment.name,
      land_area: rental.farmer.land_area,
      category: getFarmerCategory(rental.farmer.land_area),
      rental_amount: rental.total_amount,
      subsidy_amount: subsidyAmount,
      rental_status: rental.status,
      verified: rental.verified,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Approve Subsidy ─────────────────────────────────────────
async function approveSubsidy(req, res) {
  try {
    const appId = parseInt(req.params.id);
    const { remarks } = req.body;

    const app = await prisma.subsidyApplication.findUnique({ where: { application_id: appId } });
    if (!app) return res.status(404).json({ error: 'Application not found.' });
    if (app.approval_status !== 'PENDING') {
      return res.status(400).json({ error: `Application already ${app.approval_status}.` });
    }

    await prisma.$transaction([
      prisma.subsidyApplication.update({
        where: { application_id: appId },
        data: { approval_status: 'APPROVED', remarks: remarks || 'Approved by Program Officer', officer_id: req.user.userId },
      }),
      prisma.auditLog.create({
        data: {
          user_id: req.user.userId,
          action: 'SUBSIDY_APPROVED',
          entity_type: 'SUBSIDY_APPLICATION',
          entity_id: appId,
          details: `Officer ${req.user.name} approved subsidy #${appId}. Remarks: ${remarks || 'None'}`,
        },
      }),
    ]);

    res.json({ success: true, message: `Subsidy #${appId} has been APPROVED.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Reject Subsidy ──────────────────────────────────────────
async function rejectSubsidy(req, res) {
  try {
    const appId = parseInt(req.params.id);
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ error: 'Remarks are required when rejecting a subsidy.' });
    }

    const app = await prisma.subsidyApplication.findUnique({ where: { application_id: appId } });
    if (!app) return res.status(404).json({ error: 'Application not found.' });
    if (app.approval_status !== 'PENDING') {
      return res.status(400).json({ error: `Application already ${app.approval_status}.` });
    }

    await prisma.$transaction([
      prisma.subsidyApplication.update({
        where: { application_id: appId },
        data: { approval_status: 'REJECTED', remarks, officer_id: req.user.userId },
      }),
      prisma.auditLog.create({
        data: {
          user_id: req.user.userId,
          action: 'SUBSIDY_REJECTED',
          entity_type: 'SUBSIDY_APPLICATION',
          entity_id: appId,
          details: `Officer ${req.user.name} rejected subsidy #${appId}. Reason: ${remarks}`,
        },
      }),
    ]);

    res.json({ success: true, message: `Subsidy #${appId} has been REJECTED.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllSubsidies, applyForSubsidy, calculateSubsidy, approveSubsidy, rejectSubsidy };
