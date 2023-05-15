import { useState } from "react";

import { Result } from "@monoid-dev/ts-utils";
import { ZodFormattedError } from "zod";

import { SafeFormAction } from "./types";
import { AppError, AppErrors } from "@/lib/errors";

export const useAction = <Schema, Success>(
  action: SafeFormAction<Schema, Success>,
) => {
  const [error, setError] = useState<AppErrors | undefined>();
  const [loading, setLoading] = useState(false);

  const execute = async (data: Schema) => {
    const result = await safeExecute(data);

    if (Result.isRight(result)) {
      return result.right;
    } else {
      throw new AppError(result.left);
    }
  };

  const safeExecute = async (data: Schema) => {
    try {
      setLoading(true);
      const result = await action(data);

      if (Result.isLeft(result)) {
        setError(result.left);
      }

      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    get formErrors(): ZodFormattedError<Schema> | undefined {
      return error?.code === "FORM_ERROR" ? error.errors : undefined;
    },
    clearErrors: () => setError(undefined),
    loading,
    execute,
    safeExecute,
  };
};
