CREATE TABLE IF NOT EXISTS slots (
    id SERIAL PRIMARY KEY,
    class_id TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (class_id, date, time)
);

CREATE INDEX IF NOT EXISTS idx_slots_date_time ON slots (date, time);
CREATE INDEX IF NOT EXISTS idx_slots_class_id ON slots (class_id);