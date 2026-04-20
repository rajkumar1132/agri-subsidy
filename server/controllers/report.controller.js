// ============================================================
// Report Controller — Dashboard & Analytics
// ============================================================
const prisma = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const [
      totalFarmers, totalOwners, totalEquipment, availableEquipment,
      totalRentals, activeRentals, completedRentals, verifiedRentals,
      totalSubsidies, pendingSubsidies, approvedSubsidies, rejectedSubsidies,
    ] = await Promise.all([
      prisma.farmer.count(),
      prisma.equipmentOwner.count(),
      prisma.equipment.count(),
      prisma.equipment.count({ where: { status: 'AVAILABLE' } }),
      prisma.rental.count(),
      prisma.rental.count({ where: { status: 'REQUESTED' } }),
      prisma.rental.count({ where: { status: { in: ['COMPLETED', 'APPROVED'] } } }),
      prisma.rental.count({ where: { status: 'VERIFIED' } }),
      prisma.subsidyApplication.count(),
      prisma.subsidyApplication.count({ where: { approval_status: 'PENDING' } }),
      prisma.subsidyApplication.count({ where: { approval_status: 'APPROVED' } }),
      prisma.subsidyApplication.count({ where: { approval_status: 'REJECTED' } }),
    ]);

    const totalSubsidyAmount = await prisma.subsidyApplication.aggregate({
      _sum: { subsidy_amount: true },
      where: { approval_status: 'APPROVED' },
    });

    const totalRevenue = await prisma.rental.aggregate({
      _sum: { total_amount: true },
    });

    res.json({
      totalFarmers,
      totalOwners,
      totalEquipment,
      availableEquipment,
      inUseEquipment: totalEquipment - availableEquipment,
      totalRentals,
      activeRentals,
      completedRentals,
      verifiedRentals,
      totalSubsidies,
      pendingSubsidies,
      approvedSubsidies,
      rejectedSubsidies,
      totalSubsidyAmount: totalSubsidyAmount._sum.subsidy_amount || 0,
      totalRevenue: totalRevenue._sum.total_amount || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRentalHistory(req, res) {
  try {
    const { farmer_id } = req.query;
    const where = {};
    if (farmer_id) where.farmer_id = parseInt(farmer_id);
    if (req.user.userType === 'FARMER') where.farmer_id = req.user.userId;

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        farmer: { include: { user: { select: { name: true, contact_no: true } } } },
        equipment: { select: { name: true, type: true, rental_rate: true, owner: { include: { user: { select: { name: true } } } } } },
        subsidyApplication: { select: { approval_status: true, subsidy_amount: true } },
      },
      orderBy: { rental_date: 'desc' },
    });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSubsidyDistribution(req, res) {
  try {
    const byStatus = await prisma.subsidyApplication.groupBy({
      by: ['approval_status'],
      _count: true,
      _sum: { subsidy_amount: true },
      _avg: { subsidy_amount: true },
    });

    const recentApprovals = await prisma.subsidyApplication.findMany({
      where: { approval_status: 'APPROVED' },
      include: {
        rental: {
          include: {
            farmer: { include: { user: { select: { name: true } } } },
            equipment: { select: { name: true } },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
      take: 20,
    });

    res.json({ byStatus, recentApprovals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getFraudAlerts(req, res) {
  try {
    const alerts = await prisma.auditLog.findMany({
      where: {
        action: { in: ['FRAUD_ATTEMPT', 'DUPLICATE_SUBSIDY_ATTEMPT'] },
      },
      include: {
        user: { select: { name: true, user_type: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMonthlyTrends(req, res) {
  try {
    // Use raw query for monthly aggregation
    const rentalTrends = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(rental_date, '%Y-%m') as month,
        COUNT(*) as rental_count,
        SUM(total_amount) as total_revenue
      FROM rentals
      GROUP BY DATE_FORMAT(rental_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `;

    const subsidyTrends = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(application_date, '%Y-%m') as month,
        COUNT(*) as application_count,
        SUM(CASE WHEN approval_status = 'APPROVED' THEN subsidy_amount ELSE 0 END) as approved_amount
      FROM subsidy_applications
      GROUP BY DATE_FORMAT(application_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `;

    res.json({ rentalTrends, subsidyTrends });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getDashboardStats, getRentalHistory, getSubsidyDistribution, getFraudAlerts, getMonthlyTrends };
