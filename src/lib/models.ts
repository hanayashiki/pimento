import { z } from "zod";

import { defineModel } from "@/lib/server/Storage";

export const UserFields = z.object({
  id: z.number(),
  email: z.string().email(),
  inputPassword: z.string().min(6, "Password at least contain 6 chars"),
  hashedPassword: z.string(),
  nonce: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const UserDO = UserFields.pick({
  id: true,
  email: true,
  hashedPassword: true,
  nonce: true,
  created_at: true,
  updated_at: true,
});

export type UserDO = z.infer<typeof UserDO>;

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

export const LoginUserResponse = z.object({
  token: z.string(),
});

export type LoginUserResponse = z.infer<typeof LoginUserResponse>;

export const UserModel = defineModel({
  name: "User",
  do: UserDO,
  pk: "id",
  uniqueIndices: ["email"],
});

export const sensitive = z.string().brand("sensitive");

export const BasePassword = z.object({
  id: z.number(),
  user_id: z.number(), // FK
  url: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const Password = z.discriminatedUnion("type", [
  BasePassword.extend({
    type: z.literal("TEXT"),
    text: sensitive,
  }),
  BasePassword.extend({
    type: z.literal("USERNAME_PASSWORD"),
    username: sensitive,
    password: sensitive,
  }),
]);
