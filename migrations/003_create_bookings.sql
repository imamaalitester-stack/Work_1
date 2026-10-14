CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    class_id TEXT NOT NULL,
    date DATE NOT NULL,
    user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    slot_id INTEGER REFERENCES slots (id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (date);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings (class_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON bookings (slot_id);