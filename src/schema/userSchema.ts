import { z } from "zod";

export const loginUserSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  // password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerUserSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be at most 20 characters" })
    .regex(/^[a-zA-Z0-9_.]+$/, {
      message: "Username can only contain letters, numbers, underscores, and dots",
    }),
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
