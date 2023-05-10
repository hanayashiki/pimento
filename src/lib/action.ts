import { useState } from "react";

import { Result, ResultType } from "@monoid-dev/ts-utils";
import { ZodFormattedError } from "zod";

export type FormAction<Schema, Success> = (
  data: Schema,
) => Promise<ResultType<ZodFormattedError<Schema>, Success>>;

export const useAction = <Schema, Success>(
  action: FormAction<Schema, Success>,
) => {
  const [errors, setErrors] = useState<ZodFormattedError<Schema> | undefined>();
  const [loading, setLoading] = useState(false);

  const execute = async (data: Schema) => {
    if (loading) return;
    try {
      setLoading(true);
      const result = await action(data);
      if (Result.isLeft(result)) {
        setErrors(result.left);
      }
    } finally {
      setLoading(false);
    }
  };

  return { errors, clearErrors: () => setErrors(undefined), loading, execute };
};
