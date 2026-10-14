import Router from "@koa/router";
import { db } from "../db.js";
import { signToken } from "../auth.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema } from "../schemas/login.js";

const router = new Router({ prefix: "/api" });

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map();
const ipAttempts = new Map();

function getRecord(email) {
  const now = Date.now();
  const record = attempts.get(email);
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    return { count: 0, firstAttempt: now };
  }
  return record;
}

function getIpRecord(ip) {
  const now = Date.now();
  const record = ipAttempts.get(ip);
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    return { count: 0, firstAttempt: now };
  }
  return record;
}

function pruneStale(map) {
  const now = Date.now();
  for (const [key, record] of map) {
    if (now - record.firstAttempt > WINDOW_MS) map.delete(key);
  }
}

router.post("/login", validateBody(loginSchema), async (ctx) => {
  pruneStale(attempts);
  pruneStale(ipAttempts);

  const { email, password } = ctx.request.body;
  console.log("login attempt", email, password);

  const ipRecord = getIpRecord(ctx.ip);
  if (ipRecord.count >= MAX_ATTEMPTS) {
    const retryAfterMs = WINDOW_MS - (Date.now() - ipRecord.firstAttempt);
    ctx.status = 429;
    ctx.set("Retry-After", String(Math.ceil(retryAfterMs / 1000)));
    ctx.body = { error: "Too many login attempts. Please try again later." };
    return;
  }

  const record = getRecord(email);
  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterMs = WINDOW_MS - (Date.now() - record.firstAttempt);
    ctx.status = 429;
    ctx.set("Retry-After", String(Math.ceil(retryAfterMs / 1000)));
    ctx.body = { error: "Too many login attempts. Please try again later." };
    return;
  }

  const user = await db.users.findByEmail(email);
  if (!user || user.password != password) {
    record.count += 1;
    attempts.set(email, record);
    ipRecord.count += 1;
    ipAttempts.set(ctx.ip, ipRecord);
    ctx.status = 401;
    ctx.body = { error: `No account matches ${email} with that password` };
    return;
  }
  attempts.delete(email);
  ipAttempts.delete(ctx.ip);
  const token = signToken(user);
  ctx.body = { ok: true, user, token };
});

export default router;
