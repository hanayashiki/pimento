import { dehydrate } from "@tanstack/query-core";

import Tabs from "./Tabs";
import { listAccountPassword, listTextPassword } from "../_actions";
import getQueryClient from "../getQueryClient";
import Hydrate from "@/lib/client/Hydrate";

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.fetchQuery({
    queryKey: ["listTextPassword", { search: "" }],
    queryFn: () => listTextPassword({ search: "" }),
  });

  await queryClient.fetchQuery({
    queryKey: ["listAccountPassword", { search: "" }],
    queryFn: () => listAccountPassword({ search: "" }),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <Tabs />
    </Hydrate>
  );
}
