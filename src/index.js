import Koa from "koa";
import bodyParser from "koa-bodyparser";
import bookings from "./routes/bookings.js";
import login from "./routes/login.js";
import { logger, reportError } from "./logger.js";

const app = new Koa();

// Error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
    reportError(err, { path: ctx.path, method: ctx.method });
  }
});

app.on("error", (err, ctx) => {
  reportError(err, { path: ctx?.path, method: ctx?.method });
});

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Let the mobile app and the widget call us
app.use(async (ctx, next) => {
  const origin = ctx.get("Origin");
  if (origin && allowedOrigins.includes(origin)) {
    ctx.set("Access-Control-Allow-Origin", origin);
    ctx.set("Vary", "Origin");
  }
  ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (ctx.method === "OPTIONS") {
    ctx.status = 204;
    return;
  }
  await next();
});

app.use(bodyParser());
app.use(login.routes());
app.use(bookings.routes()).use(bookings.allowedMethods());

app.use(async (ctx) => {
  if (ctx.path === "/") ctx.body = { app: "bookly-api", ok: true };
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => logger.info(`bookly-api on :${port}`));

process.on("unhandledRejection", (reason) => {
  reportError(reason instanceof Error ? reason : new Error(String(reason)), { type: "unhandledRejection" });
});

process.on("uncaughtException", (err) => {
  reportError(err, { type: "uncaughtException" });
});
