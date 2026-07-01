-- =============================================
-- Removes the previously-seeded default admin
-- account (admin@fleet.com). New deployments no
-- longer insert this row (see V1), but any
-- database that already ran the old V1 migration
-- will still have it — delete it here so no
-- environment is left with a default credential.
--
-- Any refresh tokens issued to that account are
-- removed first to satisfy the FK constraint.
-- =============================================
DELETE FROM refresh_tokens
WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@fleet.com');

DELETE FROM users
WHERE email = 'admin@fleet.com';