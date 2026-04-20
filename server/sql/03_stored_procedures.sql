-- ============================================================
-- MySQL STORED PROCEDURES — Core Business Operations
-- ============================================================
USE agri_subsidy_db;

DELIMITER //

-- ============================================================
-- PROCEDURE 1: sp_apply_subsidy
-- Validates rental, computes subsidy, creates application
-- ============================================================
CREATE PROCEDURE sp_apply_subsidy(
    IN p_rental_id INT,
    IN p_farmer_id INT,
    OUT p_result VARCHAR(255),
    OUT p_application_id INT,
    OUT p_subsidy_amount FLOAT
)
BEGIN
    DECLARE v_rental_status VARCHAR(20);
    DECLARE v_rental_verified BOOLEAN;
    DECLARE v_rental_farmer INT;
    DECLARE v_total_amount FLOAT;
    DECLARE v_land_area FLOAT;
    DECLARE v_existing INT;
    DECLARE v_subsidy_pct FLOAT;
    
    -- Check rental exists
    SELECT status, verified, farmer_id, total_amount
    INTO v_rental_status, v_rental_verified, v_rental_farmer, v_total_amount
    FROM rentals WHERE rental_id = p_rental_id;
    
    IF v_rental_status IS NULL THEN
        SET p_result = 'ERROR: Rental not found.';
        SET p_application_id = 0;
        SET p_subsidy_amount = 0;
    ELSEIF v_rental_farmer != p_farmer_id THEN
        SET p_result = 'FRAUD: Rental does not belong to this farmer.';
        SET p_application_id = 0;
        SET p_subsidy_amount = 0;
    ELSEIF v_rental_status != 'VERIFIED' THEN
        SET p_result = 'REJECTED: Rental must be VERIFIED before subsidy application.';
        SET p_application_id = 0;
        SET p_subsidy_amount = 0;
    ELSEIF v_rental_verified = FALSE THEN
        SET p_result = 'REJECTED: Rental not verified by field officer.';
        SET p_application_id = 0;
        SET p_subsidy_amount = 0;
    ELSE
        -- Check for duplicate
        SELECT COUNT(*) INTO v_existing
        FROM subsidy_applications WHERE rental_id = p_rental_id;
        
        IF v_existing > 0 THEN
            SET p_result = 'DUPLICATE: Subsidy already applied for this rental.';
            SET p_application_id = 0;
            SET p_subsidy_amount = 0;
        ELSE
            -- Get farmer's land area to calculate subsidy percentage
            SELECT land_area INTO v_land_area
            FROM farmers WHERE user_id = p_farmer_id;
            
            -- Subsidy calculation based on farmer category
            IF v_land_area < 5 THEN
                SET v_subsidy_pct = 0.50;     -- Small farmer: 50%
            ELSEIF v_land_area <= 15 THEN
                SET v_subsidy_pct = 0.35;     -- Medium farmer: 35%
            ELSE
                SET v_subsidy_pct = 0.20;     -- Large farmer: 20%
            END IF;
            
            SET p_subsidy_amount = ROUND(v_total_amount * v_subsidy_pct, 2);
            
            INSERT INTO subsidy_applications (rental_id, subsidy_amount, approval_status, application_date)
            VALUES (p_rental_id, p_subsidy_amount, 'PENDING', NOW());
            
            SET p_application_id = LAST_INSERT_ID();
            SET p_result = CONCAT('SUCCESS: Application #', p_application_id, ' created for ₹', p_subsidy_amount);
        END IF;
    END IF;
END//

-- ============================================================
-- PROCEDURE 2: sp_approve_subsidy
-- Officer approves/rejects subsidy with remarks
-- ============================================================
CREATE PROCEDURE sp_approve_subsidy(
    IN p_application_id INT,
    IN p_officer_id INT,
    IN p_decision VARCHAR(10),  -- 'APPROVED' or 'REJECTED'
    IN p_remarks TEXT,
    OUT p_result VARCHAR(255)
)
BEGIN
    DECLARE v_current_status VARCHAR(20);
    
    SELECT approval_status INTO v_current_status
    FROM subsidy_applications WHERE application_id = p_application_id;
    
    IF v_current_status IS NULL THEN
        SET p_result = 'ERROR: Application not found.';
    ELSEIF v_current_status != 'PENDING' THEN
        SET p_result = CONCAT('ERROR: Application already ', v_current_status, '.');
    ELSE
        UPDATE subsidy_applications
        SET approval_status = p_decision,
            remarks = p_remarks,
            officer_id = p_officer_id,
            updated_at = NOW()
        WHERE application_id = p_application_id;
        
        -- Audit log
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (p_officer_id, CONCAT('SUBSIDY_', p_decision), 'SUBSIDY_APPLICATION', p_application_id, p_remarks);
        
        SET p_result = CONCAT('SUCCESS: Application #', p_application_id, ' has been ', p_decision, '.');
    END IF;
END//

-- ============================================================
-- PROCEDURE 3: sp_verify_rental
-- Verifier confirms equipment usage
-- ============================================================
CREATE PROCEDURE sp_verify_rental(
    IN p_rental_id INT,
    IN p_verifier_id INT,
    OUT p_result VARCHAR(255)
)
BEGIN
    DECLARE v_rental_status VARCHAR(20);
    DECLARE v_rental_verified BOOLEAN;
    
    SELECT status, verified INTO v_rental_status, v_rental_verified
    FROM rentals WHERE rental_id = p_rental_id;
    
    IF v_rental_status IS NULL THEN
        SET p_result = 'ERROR: Rental not found.';
    ELSEIF v_rental_status != 'COMPLETED' THEN
        SET p_result = CONCAT('ERROR: Rental must be COMPLETED before verification. Current: ', v_rental_status);
    ELSEIF v_rental_verified = TRUE THEN
        SET p_result = 'ERROR: Rental is already verified.';
    ELSE
        UPDATE rentals
        SET verified = TRUE,
            status = 'VERIFIED',
            updated_at = NOW()
        WHERE rental_id = p_rental_id;
        
        -- Audit log
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (p_verifier_id, 'RENTAL_VERIFIED', 'RENTAL', p_rental_id, 
                CONCAT('Rental #', p_rental_id, ' verified by verifier #', p_verifier_id));
        
        SET p_result = CONCAT('SUCCESS: Rental #', p_rental_id, ' has been verified.');
    END IF;
END//

DELIMITER ;

-- ============================================================
-- Stored procedures created successfully.
-- ============================================================
