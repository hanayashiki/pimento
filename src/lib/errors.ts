import { ZodFormattedError, z } from "zod";

export const AppErrors = z.discriminatedUnion("code", [
  z.object({
    code: z.literal("FORM_ERROR"),
    message: z.string(),
    errors: z.any(),
  }),
  z.object({
    code: z.literal("NOT_AUTHORIZED"),
    message: z.string(),
  }),
]);

export type AppErrors = z.infer<typeof AppErrors>;

export const errorOfFormError = <Schema>(
  message: string,
  errors: ZodFormattedError<Schema>,
): AppErrors => {
  return {
    code: "FORM_ERROR",
    message,
    errors,
  };
};

export class AppError extends Error {
  name = "AppError";

  constructor(public appError: AppErrors) {
    super();
  }
}
