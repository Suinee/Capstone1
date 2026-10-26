CREATE TABLE IF NOT EXISTS hesitation_log (
    log_id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    log_sequence INTEGER NOT NULL CHECK (log_sequence > 0),
    screen_id TEXT,
    screen_visit_id TEXT,
    log_type TEXT NOT NULL,
    active_time REAL NOT NULL CHECK (active_time >= 0),
    recorded_at INTEGER NOT NULL CHECK (recorded_at >= 0),
    rule_version TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    received_at INTEGER NOT NULL,
    UNIQUE (session_id, log_sequence)
);
CREATE INDEX IF NOT EXISTS idx_hesitation_session_sequence
    ON hesitation_log (session_id, log_sequence);
