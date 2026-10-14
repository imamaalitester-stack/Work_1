import { logger } from "./logger.js";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  throw new Error("Missing required environment variable: SENDGRID_API_KEY");
}

export async function sendReminder(name, date) {
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ subject: `See you on ${date}, ${name}!` }),
    });
    if (!res.ok) throw new Error(`SendGrid said ${res.status}`);
    logger.info({ name, date }, "reminder email sent");
  } catch (err) {
    logger.error({ err, name, date }, "failed to send reminder email");
    throw err;
  }
}
