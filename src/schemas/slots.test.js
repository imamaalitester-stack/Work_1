import { describe, it, expect } from "vitest";
import { z } from "zod";

// There is no dedicated slot schema/route yet, but the slots table (see
// migrations/002_create_slots.sql) defines the shape new slot-creation code
// must satisfy. This test locks in that shape so slot-creation logic added
// later has an existing contract to be checked against.
const createSlotSchema = z.object({
  classId: z.string().trim().min(1, "classId is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "time must be in HH:MM format"),
  capacity: z.number().int().positive().default(1),
});

describe("slot creation payload shape", () => {
  it("accepts a valid slot", () => {
    const result = createSlotSchema.safeParse({
      classId: "yoga-101",
      date: "2024-06-04",
      time: "09:00",
      capacity: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a slot missing required fields", () => {
    const result = createSlotSchema.safeParse({ date: "2024-06-04", time: "09:00" });
    expect(result.success).toBe(false);
  });
});