"use server";

import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { z } from "zod";

import { createAction } from "@/lib/action/server";
import { AppError } from "@/lib/errors";
import { CreateUser, LoginUser } from "@/lib/models";
import { Service } from "@/lib/server/Service";
import { UserService } from "@/lib/server/UserService";

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
