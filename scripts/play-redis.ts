import { createClient } from "@vercel/kv";

import { env } from "@/lib/env";

(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const client = createClient({
    url: env.KV2_REST_API_URL,
    token: env.KV2_REST_API_TOKEN,
  });
})();
