"use server";

import { cache } from "react";

import { errors } from "jose";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
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
} from "@/lib/models";
import { PasswordService } from "@/lib/server/PasswordService";
import { Service } from "@/lib/server/Service";
import { UserService } from "@/lib/server/UserService";

export const getUser = cache(() =>
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
  (cookies() as RequestCookies).set("token", loginResponse.token);

  return await userService.findUserByEmail(data.email);
});

export const createAccount = createAction(
  { input: CreateUser },
  async (data) => {
    const userService = Service.get(UserService);

    const user = await userService.createUser(data);

    const loginResponse = await userService.login(data);
    (cookies() as RequestCookies).set("token", loginResponse.token);

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

    return await passwordService.listAccountPasswords(user, input);
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
