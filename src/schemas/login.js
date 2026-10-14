import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("email must be a valid email address"),
  password: z.string().min(1, "password is required"),
});