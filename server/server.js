// ============================================================
// Express Server — Smart Agricultural Subsidy Management
// ============================================================
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/farmers', require('./routes/farmer.routes'));
app.use('/api/owners', require('./routes/owner.routes'));
app.use('/api/equipment', require('./routes/equipment.routes'));
app.use('/api/rentals', require('./routes/rental.routes'));
app.use('/api/verify', require('./routes/verification.routes'));
app.use('/api/subsidies', require('./routes/subsidy.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🌾 Smart Agricultural Subsidy Management System            ║
║  ──────────────────────────────────────────────────────────  ║
║  API Server:  http://0.0.0.0:${PORT}                            ║
║  Database:    MySQL (agri_subsidy_db)                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
