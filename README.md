# Smart Agricultural Equipment Sharing & Subsidy Management System

> A full-stack web application for Punjab farmers ensuring transparent and verified subsidy distribution linked to actual equipment rentals.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite 6 + Tailwind CSS 3 |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL (strict relational design) |
| **ORM** | Prisma |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Charts** | Recharts |
| **Icons** | Lucide React |

## 👥 User Roles

| Role | Email | Password | Capabilities |
|------|-------|----------|-------------|
| **Admin** | admin@agri.gov.in | password123 | Full system access, user management, audit logs |
| **Farmer** | farmer1@agri.in | password123 | Browse equipment, book rentals, apply for subsidy |
| **Equipment Owner** | owner1@agri.in | password123 | CRUD equipment, approve/complete rentals |
| **Verifier** | verifier@agri.gov.in | password123 | Verify completed rentals for subsidy eligibility |
| **Program Officer** | officer@agri.gov.in | password123 | Approve/reject subsidy applications |

## 🔧 Setup Instructions

### Prerequisites
- **Node.js** v18+ 
- **MySQL** 8.0+

### 1. Install MySQL (macOS)
```bash
brew install mysql
brew services start mysql
mysql -u root -e "CREATE DATABASE agri_subsidy_db;"
```

### 2. Configure Environment
Edit `.env` in the project root:
```
DATABASE_URL="mysql://root:@localhost:3306/agri_subsidy_db"
JWT_SECRET="your_secret_key_here"
PORT=3000
```

### 3. Install Dependencies
```bash
# From project root
cd server && npm install
cd ../client && npm install
```

### 4. Setup Database
```bash
# Generate Prisma client
cd server && npx prisma generate

# Push schema to MySQL
npx prisma db push

# Seed with ~600 records of realistic data
npx prisma db seed
```

### 5. Run the Application
```bash
# Terminal 1 — Backend (port 3000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

## 📁 Project Structure

```
SUBSIDY/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth context (JWT)
│   │   ├── pages/              # Role-specific dashboards
│   │   │   ├── admin/          # Admin dashboard
│   │   │   ├── farmer/         # Farmer dashboard
│   │   │   ├── owner/          # Equipment owner dashboard
│   │   │   ├── verifier/       # Verifier dashboard
│   │   │   └── officer/        # Program officer dashboard
│   │   └── utils/              # API client
│   └── index.html
│
├── server/                     # Express.js backend
│   ├── config/                 # Prisma client
│   ├── controllers/            # Business logic
│   ├── middleware/              # JWT auth + role guards
│   ├── prisma/                 # Schema + seed script
│   ├── routes/                 # API routes
│   ├── sql/                    # DDL, triggers, stored procedures
│   └── server.js
│
├── docs/                       # API documentation
└── .env                        # Environment config
```

## 🔄 Rental Status Flow

```
REQUESTED → APPROVED → COMPLETED → VERIFIED
    ↑           ↑          ↑           ↑
  Farmer    Owner      Owner      Verifier
  books    approves   confirms    verifies
```

**Only VERIFIED rentals can proceed to subsidy application.**

## 🛡️ Fraud Prevention

1. **One rental = one subsidy** — UNIQUE constraint on rental_id in subsidy table
2. **Verified-only subsidies** — MySQL trigger blocks unverified rental subsidies
3. **Ownership validation** — Farmers can only claim subsidies for their own rentals
4. **Duplicate detection** — API + DB-level duplicate checks
5. **Audit logging** — All actions logged with user, timestamp, and details
6. **Fraud alerts** — Dashboard shows fraud attempt history

## 📊 Database Schema (BCNF)

| Table | Key Columns |
|-------|------------|
| users | PK: user_id, ENUM user_type, email UNIQUE |
| farmers | PK/FK: user_id → users, aadhaar_no UNIQUE (12-digit) |
| equipment_owners | PK/FK: user_id → users |
| equipment | PK: equipment_id, FK: owner_id, ENUM status |
| rentals | PK: rental_id, FK: farmer_id + equipment_id, ENUM status, verified BOOL |
| subsidy_applications | PK: application_id, FK: rental_id UNIQUE, ENUM approval_status |
| audit_logs | PK: log_id, FK: user_id, action, entity tracking |

## 🗂️ Advanced DBMS Features

### Triggers (server/sql/02_triggers.sql)
- Auto-update equipment status on rental approval/completion
- Prevent subsidy on unverified rentals (SIGNAL SQLSTATE)
- Prevent duplicate subsidy applications

### Stored Procedures (server/sql/03_stored_procedures.sql)
- `sp_apply_subsidy` — Validates + creates subsidy application
- `sp_approve_subsidy` — Officer approval with audit trail
- `sp_verify_rental` — Verifier confirmation with status update

### Indexes (server/sql/04_indexes.sql)
- Composite indexes on frequently queried columns
- Covering indexes for rental and subsidy lookups

## 📈 Subsidy Calculation

| Farmer Category | Land Area | Subsidy Rate |
|----------------|-----------|-------------|
| Small Farmer | < 5 acres | 50% of rental amount |
| Medium Farmer | 5–15 acres | 35% of rental amount |
| Large Farmer | > 15 acres | 20% of rental amount |


#DEPLOYED : https://agri-subsidy-frontend.onrender.com/admin
