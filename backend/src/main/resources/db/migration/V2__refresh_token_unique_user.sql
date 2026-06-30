DELETE FROM refresh_tokens rt
WHERE rt.id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM refresh_tokens
    ORDER BY user_id, expires_at DESC
);

ALTER TABLE refresh_tokens
    ADD CONSTRAINT uq_refresh_tokens_user_id UNIQUE (user_id);