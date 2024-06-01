"use server";

import { cache } from "react";

import dayjs from "dayjs";
import { errors } from "jose";
import {
  RequestCookies,
  ResponseCookies,
} from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pipe } from "remeda";
import { z } from "zod";

import { createAction } from "@/lib/action/server";
import { AppError } from "@/lib/errors";
import {
  CreateTextPassword,
  CreateUser,
  UpdateTextPassword,
  LoginUser,
  PasswordSearch,
  CreateAccountPassword,
  UpdateAccountPassword,
  CreatePaymentCard,
  UpdatePaymentCard,
  UpsertSearchHistory,
  ListSearchHistoryQuery,
} from "@/lib/models";
import { PasswordService } from "@/lib/server/PasswordService";
import { SearchHistoryService } from "@/lib/server/SearchHistoryService";
import { Service } from "@/lib/server/Service";
import { UserService } from "@/lib/server/UserService";

export const getUser = cache(async () =>
  pipe(cookies().get("token")?.value, (token) =>
    token ? Service.get(UserService).getMeByToken(token) : null,
  ),
);

export const requireUser = cache(async () => {
  if (!cookies().get("token")?.value) {
    redirect("/login");
  }
  try {
    return (await getUser())!;
  } catch (e) {
    if (typeof e === "object" && e instanceof errors.JOSEError) {
      redirect("/login");
    }
    throw e;
  }
});

export const login = createAction({ input: LoginUser }, async (data) => {
  const userService = Service.get(UserService);

  const loginResponse = await userService.login(data);

  (cookies() as any as ResponseCookies).set({
    name: "token",
    value: loginResponse.token,
    httpOnly: true,
    sameSite: "none",
    secure: true,
    expires: dayjs().add(14, "day").toDate(),
  });

  return await userService.findUserByEmail(data.email);
});

export const logout = createAction({ input: z.undefined() }, async () => {
  (cookies() as any as ResponseCookies).delete("token");
});

export const createAccount = createAction(
  { input: CreateUser },
  async (data) => {
    const userService = Service.get(UserService);

    const user = await userService.createUser(data);

    const loginResponse = await userService.login(data);
    (cookies() as any as RequestCookies).set("token", loginResponse.token);

    return user;
  },
);

export const testThrowError = createAction({ input: z.unknown() }, async () => {
  throw new AppError({
    code: "NOT_AUTHORIZED",
    message: "114514",
  });
});

export const redirectToDashboardOrLogin = async () => {
  try {
    const user = await getUser();

    if (user) {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  } catch (e) {
    if (typeof e === "object" && e instanceof errors.JOSEError) {
      redirect("/login");
    }
    throw e;
  }
};

// TextPasswords
export const listTextPassword = createAction(
  { input: PasswordSearch },
  async (input) => {
    const user = await requireUser();

    const passwordService = Service.get(PasswordService);

    return await passwordService.listTextPasswords(user, input);
  },
);

export const createTextPassword = createAction(
  { input: CreateTextPassword },
  async (input) => {
    const user = await requireUser();
    const passwordService = Service.get(PasswordService);

    return passwordService.createTextPassword(user, input);
  },
);

export const updateTextPassword = createAction(
  { input: UpdateTextPassword },
  async (input) => {
    const user = await requireUser();
    const passwordService = Service.get(PasswordService);

    return passwordService.updateTextPassword(user, input);
  },
);

export const deleteTextPassword = createAction(
  { input: z.number() },
  async (id) => {
    const user = await requireUser();
    const passwordService = Service.get(PasswordService);

    return await passwordService.deleteTextPassword(user, id);
  },
);

// AccountPassword
export const listAccountPassword = createAction(
  { input: PasswordSearch },
  async (input) => {
    const user = await requireUser();

    const passwordService = Service.get(PasswordService);

    return await passwordService.listAccountPassword(user, input);
  },
);

export const createAccountPassword = createAction(
  { input: CreateAccountPassword },
  async (input) => {
    const user = await requireUser();
    const passwordService = Service.get(PasswordService);

    return passwordService.createAccountPassword(user, input);
  },
);

export const updateAccountPassword = createAction(
  { input: UpdateAccountPassword },
  async (input) => {
    const user = await requireUser();
    const passwordService = Service.get(PasswordService);

    return passwordService.updateAccountPassword(user, input);
  },
);

export const deleteAccountPassword = createAction(
  { input: z.number() },
  async (id) => {
    const user = await requireUser();
    const passwordService = Service.get(PasswordService);

    return await passwordService.deleteAccountPassword(user, id);
  },
);

// PaymentCard
export const listPaymentCard = createAction(
  { input: PasswordSearch },
  async (input) => {
    const user = await requireUser();
    const passwordService = Service.get(PasswordService);

    return await passwordService.listPaymentCard(user, input);
  },
);

export const createPaymentCard = createAction(
  { input: CreatePaymentCard },
  async (input) => {
    const user = await requireUser();
    const passwordService = Service.get(PasswordService);

    return await passwordService.createPaymentCard(user, input);
  },
);

export const updatePaymentCard = createAction(
  { input: UpdatePaymentCard },
  async (input) => {
    const user = await requireUser();
    const passwordService = Service.get(PasswordService);

    return passwordService.updatePaymentCard(user, input);
  },
);

export const deletePaymentCard = createAction(
  { input: z.number() },
  async (id) => {
    const user = await requireUser();
    const passwordService = Service.get(PasswordService);

    return await passwordService.deletePaymentCard(user, id);
  },
);

export const upsertSearchHistory = createAction(
  { input: UpsertSearchHistory },
  async (input) => {
    const user = await requireUser();
    const searchHistoryService = Service.get(SearchHistoryService);

    return await searchHistoryService.upsert(user, input);
  },
);

export const listSearchHistory = createAction(
  { input: ListSearchHistoryQuery },
  async (input) => {
    const user = await requireUser();
    const searchHistoryService = Service.get(SearchHistoryService);

    return await searchHistoryService.list(user, input);
  },
);

export const deleteAllSearchHistory = createAction(
  { input: z.void() },
  async () => {
    const user = await requireUser();
    const searchHistoryService = Service.get(SearchHistoryService);

    return await searchHistoryService.deleteAll(user);
  },
);
