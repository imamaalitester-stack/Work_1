// In-memory store standing in for Postgres while we prototype.
const bookings = new Map();
const users = new Map([
  ["owner@studio.test", { id: "u1", email: "owner@studio.test", password: "yoga2024", role: "owner" }],
]);

let nextId = 1;
for (const name of ["Ana", "Ben", "Chloe", "Dev", "Eli", "Fay", "Gus", "Hana", "Ivo", "Jun", "Kai", "Lea"]) {
  const id = String(nextId++);
  bookings.set(id, { id, name, classId: "flow-am", date: "2026-11-02" });
}

const delay = () => new Promise((r) => setTimeout(r, 20));

export const db = {
  bookings: {
    async list() {
      await delay();
      return [...bookings.values()];
    },
    async insert(row) {
      await delay();
      const id = String(nextId++);
      const saved = { id, ...row };
      bookings.set(id, saved);
      return saved;
    },
    async delete(id) {
      await delay();
      return bookings.delete(id);
    },
  },
  users: {
    async findByEmail(email) {
      await delay();
      return users.get(email) ?? null;
    },
  },
};
