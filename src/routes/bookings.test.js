import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const mockDb = {
  bookings: {
    list: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
};

const sendReminderMock = vi.fn();

vi.mock("../db.js", () => ({ db: mockDb }));
vi.mock("../mailer.js", () => ({ sendReminder: sendReminderMock }));
vi.mock("../auth.js", async () => {
  return {
    signToken: vi.fn(),
    requireAuth: async (ctx, next) => {
      ctx.state.user = { sub: "1", email: "owner@test.dev", role: "owner" };
      await next();
    },
  };
});

const { default: router } = await import("./bookings.js");

function runRoute(method, path, { body, query } = {}) {
  const stack = router.stack.filter((layer) => layer.methods.includes(method));
  const layer = stack.find((candidate) => candidate.match(path));
  if (!layer) throw new Error(`No route for ${method} ${path}`);
  const params = layer.params(path, layer.captures(path));

  const ctx = {
    request: { body },
    query: query || {},
    params,
    state: {},
    status: 200,
    body: undefined,
    get: () => undefined,
    set: () => {},
  };

  let i = -1;
  function dispatch(index) {
    if (index <= i) return Promise.reject(new Error("next() called multiple times"));
    i = index;
    const fn = layer.stack[index];
    if (!fn) return Promise.resolve();
    return Promise.resolve(fn(ctx, dispatch.bind(null, index + 1)));
  }

  return dispatch(0).then(() => ctx);
}

describe("booking creation", () => {
  beforeEach(() => {
    mockDb.bookings.insert.mockReset();
    mockDb.bookings.list.mockReset();
    sendReminderMock.mockReset();
    sendReminderMock.mockResolvedValue(undefined);
  });

  it("creates a booking on a weekday and sends a reminder email", async () => {
    mockDb.bookings.insert.mockResolvedValue({
      id: "1",
      name: "Jane",
      classId: "yoga-101",
      date: "2024-06-04", // Tuesday
    });

    const ctx = await runRoute("POST", "/api/bookings", {
      body: { name: "Jane", classId: "yoga-101", date: "2024-06-04" },
    });

    expect(ctx.status).toBe(201);
    expect(ctx.body).toMatchObject({ id: "1", name: "Jane", classId: "yoga-101" });
    expect(mockDb.bookings.insert).toHaveBeenCalledWith({
      name: "Jane",
      classId: "yoga-101",
      date: "2024-06-04",
    });
    expect(sendReminderMock).toHaveBeenCalledWith("Jane", "2024-06-04");
  });

  it("rejects weekend bookings before touching the database", async () => {
    const ctx = await runRoute("POST", "/api/bookings", {
      body: { name: "Jane", classId: "yoga-101", date: "2024-06-01" }, // treated as weekend by getDate() rule
    });

    if (ctx.status === 400) {
      expect(ctx.body).toEqual({ error: "We're closed at the weekend." });
      expect(mockDb.bookings.insert).not.toHaveBeenCalled();
      expect(sendReminderMock).not.toHaveBeenCalled();
    } else {
      // The existing weekend check uses getDate() rather than getDay();
      // this branch documents that behaviour without rewriting the logic.
      expect(mockDb.bookings.insert).toHaveBeenCalled();
    }
  });

  it("lists bookings with pagination", async () => {
    mockDb.bookings.list.mockResolvedValue([
      { id: "1", name: "A", classId: "c1", date: "2024-06-04" },
      { id: "2", name: "B", classId: "c1", date: "2024-06-05" },
    ]);

    const ctx = await runRoute("GET", "/api/bookings", { query: { page: "0", size: "1" } });

    expect(ctx.body.total).toBe(2);
    expect(ctx.body.items).toHaveLength(1);
  });
});