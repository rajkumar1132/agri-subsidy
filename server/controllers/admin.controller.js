// ============================================================
// Admin Controller
// ============================================================
const prisma = require('../config/db');

async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        user_id: true, name: true, email: true, contact_no: true,
        address: true, user_type: true, created_at: true,
        farmer: { select: { aadhaar_no: true, land_area: true } },
      },
      orderBy: { user_id: 'asc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAuditLog(req, res) {
  try {
    const { action, limit = 100 } = req.query;
    const where = {};
    if (action) where.action = { contains: action };

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, user_type: true } } },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }

    await prisma.user.delete({ where: { user_id: userId } });

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'USER_DELETED',
        entity_type: 'USER',
        entity_id: userId,
        details: `Admin deleted user #${userId}`,
      },
    });

    res.json({ success: true, message: `User #${userId} deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function executeQuery(req, res) {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required.' });

    // Basic safety check string matching
    const upperQuery = query.trim().toUpperCase();
    if (!upperQuery.startsWith('SELECT') && !upperQuery.startsWith('SHOW') && !upperQuery.startsWith('DESCRIBE')) {
      return res.status(403).json({ error: 'Only read-only queries (SELECT, SHOW, DESCRIBE) are allowed for safety.' });
    }

    // Execute raw query
    const results = await prisma.$queryRawUnsafe(query);

    // Prisma might return BigInt for COUNT. JSON.stringify fails on BigInt.
    const jsonStr = JSON.stringify(results, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value
    );
    
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonStr);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllUsers, getAuditLog, deleteUser, executeQuery };
