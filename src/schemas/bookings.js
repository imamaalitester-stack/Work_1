import { z } from "zod";

export const createBookingSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  classId: z.string().trim().min(1, "classId is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format"),
});