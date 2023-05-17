import { z } from "zod";

import { Sensitive } from "./Sensitive";
import { ZodAnyObject } from "./types";
import { ForeignKeyMap, Model } from "@/lib/server/Storage";

export const defineModel = <
  S extends ZodAnyObject = ZodAnyObject,
  FK extends ForeignKeyMap = {},
>(
  model: Model<S, FK>,
) => model;

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
  fks: {},
});

export const BasePasswordDO = z.object({
  id: z.number(),
  user_id: z.number(), // FK
  url: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const TextPasswordDO = BasePasswordDO.extend({
  type: z.literal("TEXT"),
  text: Sensitive,
});

export type TextPasswordDO = z.infer<typeof TextPasswordDO>;

export const CreateTextPassword = TextPasswordDO.pick({
  url: true,
  type: true,
  text: true,
});

export type CreateTextPassword = z.infer<typeof CreateTextPassword>;

export const TextPasswordModel = defineModel({
  name: "TextPassword",
  do: TextPasswordDO,
  pk: "id",
  uniqueIndices: [],
  fks: {
    user_id: UserModel,
  },
});

export const AccountPassword = BasePasswordDO.extend({
  type: z.literal("TEXT"),
  username: Sensitive,
  password: Sensitive,
});

export type AccountPassword = z.infer<typeof AccountPassword>;

export const AccountPasswordModel = defineModel({
  name: "AccountPassword",
  do: AccountPassword,
  pk: "id",
  uniqueIndices: [],
  fks: {
    user_id: UserModel,
  },
});

export type PasswordDefinition = {
  name: string;
  label: string;
};

export const passwordDefinitions = [
  {
    name: "TextPassword",
    label: "text",
  },
  {
    name: "AccountPassword",
    label: "account",
  },
] as const satisfies readonly PasswordDefinition[];
