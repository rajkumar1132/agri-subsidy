-- ============================================================
-- MySQL INDEXES — Performance Optimization
-- ============================================================
USE agri_subsidy_db;

-- Composite indexes for common query patterns
CREATE INDEX idx_rental_farmer_status ON rentals(farmer_id, status);
CREATE INDEX idx_rental_equipment_status ON rentals(equipment_id, status);
CREATE INDEX idx_subsidy_status_date ON subsidy_applications(approval_status, application_date);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_rental_date ON rentals(rental_date);

-- ============================================================
-- Indexes created successfully.
-- ============================================================
