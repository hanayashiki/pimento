import { ResultType } from "@monoid-dev/ts-utils";

import { AppErrors } from "../errors";

export type FormAction<Schema, Success> = (data: Schema) => Promise<Success>;

export type SafeFormAction<Schema, Success> = (
  data: Schema,
) => Promise<ResultType<AppErrors, Success>>;
