import { Result, ResultType } from "@monoid-dev/ts-utils";
import { ZodTypeAny, z } from "zod";

import { FormAction } from "./types";
import { AppError, AppErrors } from "@/lib/errors";

export interface ActionOptions<S extends ZodTypeAny> {
  input: S;
}

export const createAction =
  <S extends ZodTypeAny, Success, Schema = z.infer<S>>(
    options: ActionOptions<S>,
    action: FormAction<Schema, Success>,
  ): ((data: Schema) => Promise<ResultType<AppErrors, Success>>) =>
  async (data: Schema) => {
    const result = options.input.safeParse(data);
    if (!result.success) {
      throw new AppError({
        code: "FORM_ERROR",
        message: "Fix your errors in the form. ",
        errors: result.error.format(),
      });
    }

    try {
      return Result.ofRight(await action(result.data));
    } catch (e) {
      if (e instanceof AppError) {
        const parsed = AppErrors.safeParse(e.appError);

        if (parsed.success) {
          return Result.ofLeft(parsed.data);
        } else {
          throw e;
        }
      }
      throw e;
    }
  };
