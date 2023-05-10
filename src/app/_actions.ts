"use server";

import { Result } from "@monoid-dev/ts-utils";

import { FormAction } from "@/lib/action";
import { LoginUser } from "@/lib/models";

export const loginInOrSignUp: FormAction<LoginUser, true> = async (
  data: LoginUser,
) => {
  const validated = LoginUser.safeParse(data);

  if (!validated.success) return Result.ofLeft(validated.error.format());

  return Result.ofRight(true);
};
