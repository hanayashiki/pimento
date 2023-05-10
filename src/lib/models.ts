import { z } from "zod";

export const UserFields = z.object({
  id: z.string(),
  email: z.string().email(),
  inputPassword: z.string().min(6, "Password at least contain 6 chars"),
  hashedPassword: z.string(),
  nonce: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const User = UserFields.pick({
  id: true,
  email: true,
  created_at: true,
  updated_at: true,
});

export type User = z.infer<typeof User>;

export const CreateUser = UserFields.pick({
  email: true,
  inputPassword: true,
});

export type CreateUser = z.infer<typeof CreateUser>;

export const LoginUser = UserFields.pick({
  email: true,
  inputPassword: true,
});

export type LoginUser = z.infer<typeof LoginUser>;
