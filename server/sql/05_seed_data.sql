-- ============================================================
-- Sample INSERT Queries — Punjab Agricultural Data
-- Run after schema creation (01_schema.sql)
-- ============================================================
USE agri_subsidy_db;

-- ── SYSTEM USERS (Admin, Verifier, Officer) ─────────────────
-- Password hash = bcrypt('password123')
-- $2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK

INSERT INTO users (name, email, password, contact_no, address, user_type) VALUES
('Rajinder Kumar (Admin)', 'admin@agri.gov.in', '$2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK', '9876500001', 'Block Office, Chandigarh, Punjab', 'ADMIN'),
('Harpal Singh (Verifier)', 'verifier@agri.gov.in', '$2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK', '9876500002', 'Tehsil Office, Ludhiana, Punjab', 'VERIFIER'),
('Dr. Amarjit Singh (Officer)', 'officer@agri.gov.in', '$2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK', '9876500004', 'District HQ, Ludhiana, Punjab', 'PROGRAM_OFFICER');

-- ── FARMER USERS ────────────────────────────────────────────
INSERT INTO users (name, email, password, contact_no, address, user_type) VALUES
('Gurpreet Singh', 'farmer1@agri.in', '$2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK', '9876543210', 'Village Khanna, Ludhiana, Punjab', 'FARMER'),
('Harmanpreet Kaur', 'farmer2@agri.in', '$2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK', '9876543211', 'Village Nihal Singh Wala, Moga, Punjab', 'FARMER'),
('Amritpal Singh', 'farmer3@agri.in', '$2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK', '9876543212', 'Village Tapa, Barnala, Punjab', 'FARMER'),
('Rajveer Sandhu', 'farmer4@agri.in', '$2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK', '9876543213', 'Village Rajpura, Patiala, Punjab', 'FARMER'),
('Sukhwinder Gill', 'farmer5@agri.in', '$2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK', '9876543214', 'Village Phillaur, Jalandhar, Punjab', 'FARMER');

-- ── FARMER PROFILES ─────────────────────────────────────────
-- (user_id values depend on auto-increment — adjust as needed)
INSERT INTO farmers (user_id, aadhaar_no, land_area) VALUES
(4, '211111111111', 3.50),
(5, '222222222222', 8.25),
(6, '233333333333', 2.00),
(7, '244444444444', 12.75),
(8, '255555555555', 22.00);

-- ── EQUIPMENT OWNERS ────────────────────────────────────────
INSERT INTO users (name, email, password, contact_no, address, user_type) VALUES
('Balwinder Singh Machinery', 'owner1@agri.in', '$2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK', '9876543240', 'GT Road, Ludhiana, Punjab', 'EQUIPMENT_OWNER'),
('Punjab Agro Equipments', 'owner2@agri.in', '$2a$12$LJ3UlWmr4YEZBtm6DnaLOuGnJPNJFGGnR.oJA4dKfAKSJvtsu5/yK', '9876543241', 'Industrial Area, Patiala, Punjab', 'EQUIPMENT_OWNER');

INSERT INTO equipment_owners (user_id) VALUES (9), (10);

-- ── SAMPLE EQUIPMENT ────────────────────────────────────────
INSERT INTO equipment (name, type, rental_rate, status, owner_id) VALUES
('Mahindra 575 DI Tractor', 'Tractor', 1500, 'AVAILABLE', 9),
('Swaraj 744 FE Tractor', 'Tractor', 1800, 'AVAILABLE', 9),
('Massey Ferguson 1035 DI', 'Tractor', 1600, 'AVAILABLE', 10),
('Combine Harvester TC-5070', 'Harvester', 5000, 'AVAILABLE', 10),
('Rotavator 7 Feet', 'Tiller', 800, 'AVAILABLE', 9),
('Happy Seeder', 'Seeder', 1500, 'AVAILABLE', 10),
('Laser Land Leveler', 'Leveler', 3500, 'AVAILABLE', 9);

-- ── SAMPLE RENTALS ──────────────────────────────────────────
INSERT INTO rentals (farmer_id, equipment_id, duration, total_amount, status, verified) VALUES
(4, 1, 5, 7500, 'VERIFIED', TRUE),
(5, 3, 3, 4800, 'VERIFIED', TRUE),
(6, 2, 7, 12600, 'COMPLETED', FALSE),
(7, 4, 2, 10000, 'APPROVED', FALSE),
(8, 5, 10, 8000, 'REQUESTED', FALSE);

-- ── SAMPLE SUBSIDY APPLICATIONS ─────────────────────────────
INSERT INTO subsidy_applications (rental_id, subsidy_amount, approval_status, remarks) VALUES
(1, 3750, 'APPROVED', 'Verified and approved — Small farmer 50% subsidy'),
(2, 1680, 'PENDING', NULL);

-- ============================================================
-- Note: For full 600+ records, use: npx prisma db seed
-- ============================================================
