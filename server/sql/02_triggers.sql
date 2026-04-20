-- ============================================================
-- MySQL TRIGGERS — Business Logic Enforcement
-- ============================================================
USE agri_subsidy_db;

DELIMITER //

-- ============================================================
-- TRIGGER 1: Auto-update equipment status to 'IN_USE'
-- When a rental is APPROVED
-- ============================================================
CREATE TRIGGER trg_rental_approved_equip_in_use
AFTER UPDATE ON rentals
FOR EACH ROW
BEGIN
    IF NEW.status = 'APPROVED' AND OLD.status = 'REQUESTED' THEN
        UPDATE equipment 
        SET status = 'IN_USE', updated_at = NOW()
        WHERE equipment_id = NEW.equipment_id;
    END IF;
END//

-- ============================================================
-- TRIGGER 2: Auto-update equipment status to 'AVAILABLE'
-- When a rental is COMPLETED or VERIFIED
-- ============================================================
CREATE TRIGGER trg_rental_complete_equip_available
AFTER UPDATE ON rentals
FOR EACH ROW
BEGIN
    IF (NEW.status = 'COMPLETED' AND OLD.status = 'APPROVED') OR
       (NEW.status = 'VERIFIED' AND OLD.status = 'COMPLETED') THEN
        UPDATE equipment 
        SET status = 'AVAILABLE', updated_at = NOW()
        WHERE equipment_id = NEW.equipment_id;
    END IF;
END//

-- ============================================================
-- TRIGGER 3: Prevent subsidy on unverified rental
-- BEFORE INSERT on subsidy_applications
-- ============================================================
CREATE TRIGGER trg_prevent_unverified_subsidy
BEFORE INSERT ON subsidy_applications
FOR EACH ROW
BEGIN
    DECLARE rental_verified BOOLEAN;
    DECLARE rental_status VARCHAR(20);
    
    SELECT verified, status INTO rental_verified, rental_status
    FROM rentals WHERE rental_id = NEW.rental_id;
    
    IF rental_verified = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FRAUD ALERT: Cannot apply subsidy — rental is NOT verified.';
    END IF;
    
    IF rental_status != 'VERIFIED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FRAUD ALERT: Cannot apply subsidy — rental status must be VERIFIED.';
    END IF;
END//

-- ============================================================
-- TRIGGER 4: Prevent duplicate subsidy (backup constraint)
-- ============================================================
CREATE TRIGGER trg_prevent_duplicate_subsidy
BEFORE INSERT ON subsidy_applications
FOR EACH ROW
BEGIN
    DECLARE existing_count INT;
    
    SELECT COUNT(*) INTO existing_count
    FROM subsidy_applications 
    WHERE rental_id = NEW.rental_id;
    
    IF existing_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FRAUD ALERT: Duplicate subsidy application — rental already has a subsidy.';
    END IF;
END//

DELIMITER ;

-- ============================================================
-- Triggers created successfully.
-- ============================================================
