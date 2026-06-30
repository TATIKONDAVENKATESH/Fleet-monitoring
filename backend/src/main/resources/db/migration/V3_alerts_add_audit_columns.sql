-- Alert now extends BaseEntity for consistent auditing with every other
-- entity in the system (it previously tracked created_at manually only).
ALTER TABLE alerts
    ADD COLUMN updated_at TIMESTAMP,
    ADD COLUMN created_by VARCHAR(255),
    ADD COLUMN updated_by VARCHAR(255);
