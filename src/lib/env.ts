import { z } from "zod";

export const env = z
  .object({
    APP_SECRET: z.string(),
    KV2_URL: z.string(),
    KV2_REST_API_URL: z.string(),
    KV2_REST_API_TOKEN: z.string(),
    KV2_REST_API_READ_ONLY_TOKEN: z.string(),
  })
  .parse(process.env);
