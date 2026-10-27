CREATE TABLE IF NOT EXISTS public_application (
 request_id TEXT PRIMARY KEY,
 session_id TEXT NOT NULL,
 service_code TEXT NOT NULL,
 service_name TEXT NOT NULL,
 receipt_no TEXT NOT NULL UNIQUE,
 received_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_public_application_session ON public_application(session_id, received_at);
