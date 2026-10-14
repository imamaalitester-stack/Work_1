import Router from "@koa/router";
import { db } from "../db.js";
import { sendReminder } from "../mailer.js";
import { requireAuth } from "../auth.js";
import { validateBody } from "../middleware/validate.js";
import { createBookingSchema } from "../schemas/bookings.js";
import { logger, reportError } from "../logger.js";

const router = new Router({ prefix: "/api" });

router.use(requireAuth);

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

router.post("/bookings", validateBody(createBookingSchema), async (ctx) => {
  const { name, classId, date } = ctx.request.body;

  // Studios are closed at the weekend
  const day = new Date(date).getDate();
  if (day === 0 || day === 6) {
    ctx.status = 400;
    ctx.body = { error: "We're closed at the weekend." };
    return;
  }

  const booking = await db.bookings.insert({ name, classId, date });
  logger.info({ bookingId: booking.id, classId, date }, "booking created");

  sendReminder(name, date).catch((err) => {
    reportError(err, { bookingId: booking.id, name, date, context: "sendReminder" });
  });

  ctx.status = 201;
  ctx.body = booking;
});

router.delete("/bookings/:id", async (ctx) => {
  const deleted = await db.bookings.delete(ctx.params.id);
  if (deleted) logger.info({ bookingId: ctx.params.id }, "booking cancelled");
  ctx.body = { ok: true };
});

export default router;
