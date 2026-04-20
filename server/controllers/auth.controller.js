// ============================================================
// Auth Controller — JWT Registration & Login
// ============================================================
const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// ── Register ────────────────────────────────────────────────
async function register(req, res) {
  try {
    const { name, email, password, contact_no, address, user_type, aadhaar_no, land_area } = req.body;

    // Validate required fields
    if (!name || !email || !password || !contact_no || !address || !user_type) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate user_type
    const validTypes = ['FARMER', 'EQUIPMENT_OWNER', 'VERIFIER', 'PROGRAM_OFFICER'];
    if (!validTypes.includes(user_type)) {
      return res.status(400).json({ error: `Invalid user type. Must be one of: ${validTypes.join(', ')}` });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Validate Aadhaar for farmers
    if (user_type === 'FARMER') {
      if (!aadhaar_no || !/^\d{12}$/.test(aadhaar_no)) {
        return res.status(400).json({ error: 'Valid 12-digit Aadhaar number is required for farmers.' });
      }
      if (!land_area || land_area <= 0) {
        return res.status(400).json({ error: 'Valid land area (in acres) is required for farmers.' });
      }
      // Check duplicate aadhaar
      const existingAadhaar = await prisma.farmer.findUnique({ where: { aadhaar_no } });
      if (existingAadhaar) {
        return res.status(400).json({ error: 'Aadhaar number already registered.' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with role-specific data in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          contact_no,
          address,
          user_type,
        },
      });

      if (user_type === 'FARMER') {
        await tx.farmer.create({
          data: {
            user_id: newUser.user_id,
            aadhaar_no,
            land_area: parseFloat(land_area),
          },
        });
      } else if (user_type === 'EQUIPMENT_OWNER') {
        await tx.equipmentOwner.create({
          data: { user_id: newUser.user_id },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          user_id: newUser.user_id,
          action: 'USER_REGISTERED',
          entity_type: 'USER',
          entity_id: newUser.user_id,
          details: `${user_type} registration: ${name}`,
        },
      });

      return newUser;
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. ' + err.message });
  }
}

// ── Login ───────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: user.user_id,
        action: 'USER_LOGIN',
        entity_type: 'USER',
        entity_id: user.user_id,
        details: `Login from ${req.ip}`,
      },
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. ' + err.message });
  }
}

// ── Get Current User ────────────────────────────────────────
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.userId },
      select: {
        user_id: true,
        name: true,
        email: true,
        contact_no: true,
        address: true,
        user_type: true,
        created_at: true,
        farmer: true,
        equipmentOwner: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login, getMe };
