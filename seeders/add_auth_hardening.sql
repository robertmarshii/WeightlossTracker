-- Sign-in hardening (Nov 2026). The app runs this itself, once per schema, on first use
-- (AuthManager::ensureSchema, also triggered by /status). Run by hand only if the database
-- user is not allowed to alter tables. Shown for wt_live; repeat for other schemas.
-- Run it ONCE: the UPDATE hashes the stored tokens, so running it twice would sign everyone out.
BEGIN;
LOCK TABLE wt_live.users IN SHARE ROW EXCLUSIVE MODE;
-- Sign-out ends sessions on every device
ALTER TABLE wt_live.users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0;
-- Remember-me never lasts more than 90 days after sign-in
ALTER TABLE wt_live.users ADD COLUMN remember_token_issued_at TIMESTAMP NULL;
-- Store sha256(token) instead of the token; people who are signed in stay signed in
UPDATE wt_live.users
   SET remember_token = encode(sha256(convert_to(remember_token, 'UTF8')), 'hex'),
       remember_token_issued_at = NOW()
 WHERE remember_token IS NOT NULL;
-- Wrong guesses per login code, counted atomically
ALTER TABLE wt_live.auth_codes ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
COMMIT;
