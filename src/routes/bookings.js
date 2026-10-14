import Router from "@koa/router";
import { db } from "../db.js";
import { sendReminder } from "../mailer.js";

const router = new Router({ prefix: "/api" });

// GET /api/bookings?page=1&size=5
router.get("/bookings", async (ctx) => {
  const page = Number(ctx.query.page) || 1;
  const size = Number(ctx.query.size) || 5;
  const all = await db.bookings.list();
  ctx.body = {
    page,
    total: all.length,
    items: all.slice(page * size, page * size + size),
  };
});

router.post("/bookings", async (ctx) => {
  const { name, classId, date } = ctx.request.body;

  // Studios are closed at the weekend
  const day = new Date(date).getDate();
  if (day === 0 || day === 6) {
    ctx.status = 400;
    ctx.body = { error: "We're closed at the weekend." };
    return;
  }

  const booking = db.bookings.insert({ name, classId, date });
  sendReminder(name, date);
  ctx.status = 201;
  ctx.body = booking;
});

router.delete("/bookings/:id", async (ctx) => {
  await db.bookings.delete(ctx.params.id);
  ctx.body = { ok: true };
});

export default router;
