-- ============================================================
-- Smart Agricultural Equipment Sharing & Subsidy Management
-- MySQL DDL — Schema Creation (Strict Relational Design)
-- Normalization: BCNF
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS agri_subsidy_db;
USE agri_subsidy_db;

-- ============================================================
-- 1. USERS — Base entity for all system participants
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(100)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    contact_no  VARCHAR(15)   NOT NULL,
    address     VARCHAR(200)  NOT NULL,
    user_type   ENUM('ADMIN', 'FARMER', 'EQUIPMENT_OWNER', 'VERIFIER', 'PROGRAM_OFFICER') NOT NULL,
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_type (user_type)
) ENGINE=InnoDB;

-- ============================================================
-- 2. FARMERS — ISA specialization of USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS farmers (
    user_id     INT PRIMARY KEY,
    aadhaar_no  VARCHAR(12) NOT NULL UNIQUE,
    land_area   FLOAT       NOT NULL,
    CONSTRAINT fk_farmer_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_aadhaar_len CHECK (CHAR_LENGTH(aadhaar_no) = 12),
    CONSTRAINT chk_aadhaar_numeric CHECK (aadhaar_no REGEXP '^[0-9]{12}$'),
    CONSTRAINT chk_land_area CHECK (land_area > 0)
) ENGINE=InnoDB;

-- ============================================================
-- 3. EQUIPMENT_OWNERS — ISA specialization of USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment_owners (
    user_id INT PRIMARY KEY,
    CONSTRAINT fk_owner_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. EQUIPMENT — Equipment available for sharing
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    type         VARCHAR(50)  NOT NULL,
    rental_rate  FLOAT        NOT NULL,
    status       ENUM('AVAILABLE', 'IN_USE') DEFAULT 'AVAILABLE' NOT NULL,
    owner_id     INT          NOT NULL,
    created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_equip_owner FOREIGN KEY (owner_id)
        REFERENCES equipment_owners(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_rental_rate CHECK (rental_rate > 0),
    INDEX idx_owner (owner_id),
    INDEX idx_status (status),
    INDEX idx_type (type)
) ENGINE=InnoDB;

-- ============================================================
-- 5. RENTALS — Equipment rental transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS rentals (
    rental_id    INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id    INT          NOT NULL,
    equipment_id INT          NOT NULL,
    duration     INT          NOT NULL,
    total_amount FLOAT        NOT NULL,
    status       ENUM('REQUESTED', 'APPROVED', 'COMPLETED', 'VERIFIED') DEFAULT 'REQUESTED' NOT NULL,
    verified     BOOLEAN      DEFAULT FALSE,
    rental_date  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rental_farmer FOREIGN KEY (farmer_id)
        REFERENCES farmers(user_id),
    CONSTRAINT fk_rental_equip FOREIGN KEY (equipment_id)
        REFERENCES equipment(equipment_id),
    CONSTRAINT chk_duration CHECK (duration > 0),
    CONSTRAINT chk_total_amount CHECK (total_amount > 0),
    INDEX idx_farmer (farmer_id),
    INDEX idx_equipment (equipment_id),
    INDEX idx_rental_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- 6. SUBSIDY_APPLICATIONS — Linked to ONE verified rental
-- ============================================================
CREATE TABLE IF NOT EXISTS subsidy_applications (
    application_id   INT AUTO_INCREMENT PRIMARY KEY,
    rental_id        INT          NOT NULL UNIQUE,
    subsidy_amount   FLOAT        NOT NULL,
    approval_status  ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' NOT NULL,
    remarks          TEXT,
    officer_id       INT,
    application_date DATETIME     DEFAULT CURRENT_TIMESTAMP,
    created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subsidy_rental FOREIGN KEY (rental_id)
        REFERENCES rentals(rental_id),
    CONSTRAINT fk_subsidy_officer FOREIGN KEY (officer_id)
        REFERENCES users(user_id),
    CONSTRAINT chk_subsidy_amount CHECK (subsidy_amount > 0),
    INDEX idx_subsidy_rental (rental_id),
    INDEX idx_subsidy_status (approval_status)
) ENGINE=InnoDB;

-- ============================================================
-- 7. AUDIT_LOGS — System-wide action tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          NOT NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   INT,
    details     TEXT,
    timestamp   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB;

-- ============================================================
-- Schema creation complete.
-- ============================================================
