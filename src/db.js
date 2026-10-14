import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL });

export const db = {
  bookings: {
    async list() {
      const { rows } = await pool.query(
        "SELECT id, name, class_id AS \"classId\", date FROM bookings ORDER BY id"
      );
      return rows.map((row) => ({ ...row, id: String(row.id) }));
    },
    async insert(row) {
      const { rows } = await pool.query(
        'INSERT INTO bookings (name, class_id, date) VALUES ($1, $2, $3) RETURNING id, name, class_id AS "classId", date',
        [row.name, row.classId, row.date]
      );
      const saved = rows[0];
      return { ...saved, id: String(saved.id) };
    },
    async delete(id) {
      const { rowCount } = await pool.query("DELETE FROM bookings WHERE id = $1", [id]);
      return rowCount > 0;
    },
  },
  users: {
    async findByEmail(email) {
      const { rows } = await pool.query(
        "SELECT id, email, password, role FROM users WHERE email = $1",
        [email]
      );
      if (!rows[0]) return null;
      return { ...rows[0], id: String(rows[0].id) };
    },
  },
};
