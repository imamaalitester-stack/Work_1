import pino from "pino";
import * as Sentry from "@sentry/node";

const SENTRY_DSN = process.env.SENTRY_DSN;

export const sentryEnabled = Boolean(SENTRY_DSN);

if (sentryEnabled) {
  Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0 });
}

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export function reportError(err, context = {}) {
  logger.error({ err, ...context }, err.message);
  if (sentryEnabled) {
    Sentry.captureException(err, { extra: context });
  }
}

export function flushSentry() {
  if (sentryEnabled) {
    return Sentry.close(2000);
  }
  return Promise.resolve();
}