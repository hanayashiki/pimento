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
  email: z.coerce.string().email(),
  inputPassword: z.coerce.string().min(6, "Password at least contain 6 chars"),
  hashedPassword: z.coerce.string(),
  nonce: z.coerce.string(),
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
  nonce: true,
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
  url: z.coerce.string(),
  name: z.coerce.string(),
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
  name: true,
  text: true,
});

export type CreateTextPassword = z.infer<typeof CreateTextPassword>;

export const UpdateTextPassword = TextPasswordDO.pick({
  id: true,
  url: true,
  type: true,
  name: true,
  text: true,
});

export type UpdateTextPassword = z.infer<typeof UpdateTextPassword>;

export const TextPasswordModel = defineModel({
  name: "TextPassword",
  do: TextPasswordDO,
  pk: "id",
  uniqueIndices: [],
  fks: {
    user_id: UserModel,
  },
});

export const AccountPasswordDO = BasePasswordDO.extend({
  type: z.literal("ACCOUNT"),
  username: Sensitive,
  password: Sensitive,
});

export type AccountPasswordDO = z.infer<typeof AccountPasswordDO>;

export const CreateAccountPassword = AccountPasswordDO.pick({
  url: true,
  type: true,
  name: true,
  username: true,
  password: true,
});

export type CreateAccountPassword = z.infer<typeof CreateAccountPassword>;

export const UpdateAccountPassword = AccountPasswordDO.pick({
  id: true,
  url: true,
  type: true,
  name: true,
  username: true,
  password: true,
});

export type UpdateAccountPassword = z.infer<typeof UpdateAccountPassword>;

export const AccountPasswordModel = defineModel({
  name: "AccountPassword",
  do: AccountPasswordDO,
  pk: "id",
  uniqueIndices: [],
  fks: {
    user_id: UserModel,
  },
});

export const PaymentCardBrand = z.enum([
  "Visa",
  "Mastercard",
  "Maestro",
  "Discover",
  "Diners Club",
  "JCB",
  "UnionPay",
  "Amex",
  "Other",
]);

export type PaymentCardBrand = z.infer<typeof PaymentCardBrand>;

export const PaymentCardDO = BasePasswordDO.extend({
  type: z.literal("PAYMENT_CARD"),
  pan: Sensitive,
  expirationDate: Sensitive,
  cardholder: Sensitive,
  cvv: Sensitive,
  lastDigits: z.coerce.string(),
  brand: PaymentCardBrand,
});

export type PaymentCardDO = z.infer<typeof PaymentCardDO>;

export const CreatePaymentCard = PaymentCardDO.pick({
  url: true,
  type: true,
  name: true,
  pan: true,
  expirationDate: true,
  cardholder: true,
  cvv: true,
  lastDigits: true,
  brand: true,
});

export type CreatePaymentCard = z.infer<typeof CreatePaymentCard>;

export const UpdatePaymentCard = PaymentCardDO.pick({
  id: true,
  url: true,
  type: true,
  name: true,
  pan: true,
  expirationDate: true,
  cardholder: true,
  cvv: true,
  lastDigits: true,
  brand: true,
});

export type UpdatePaymentCard = z.infer<typeof UpdatePaymentCard>;

export const PaymentCardModel = defineModel({
  name: "PaymentCard",
  do: PaymentCardDO,
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
  {
    name: "PaymentCard",
    label: "payment card",
  },
] as const satisfies readonly PasswordDefinition[];

export const PasswordOrderBy = z.enum(["asc", "desc"]);

export const PasswordOrder = z.object({
  key: z.string(),
  orderBy: PasswordOrderBy,
});

export type PasswordOrder = z.infer<typeof PasswordOrder>;

export const PasswordSearch = z.object({
  search: z.string(),
  orders: PasswordOrder.array(),
});

export type PasswordSearch = z.infer<typeof PasswordSearch>;
