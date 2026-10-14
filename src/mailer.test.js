import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

process.env.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "test-key";

const { sendReminder } = await import("./mailer.js");

describe("sendReminder", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("calls SendGrid with the expected payload", async () => {
    global.fetch.mockResolvedValue({ ok: true });

    await sendReminder("Jane", "2024-06-04");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.sendgrid.com/v3/mail/send",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ subject: "See you on 2024-06-04, Jane!" }),
      })
    );
  });

  it("throws when SendGrid responds with a non-OK status", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(sendReminder("Jane", "2024-06-04")).rejects.toThrow("SendGrid said 500");
  });
});