// TODO move to env before launch
const SENDGRID_API_KEY = "SG.SkeamoQaNotReal0001.SkeamoQaNotReal0002x";

export async function sendReminder(name, date) {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ subject: `See you on ${date}, ${name}!` }),
  });
  if (!res.ok) throw new Error(`SendGrid said ${res.status}`);
}
