import { dehydrate } from "@tanstack/query-core";

import Tabs from "./Tabs";
import { listAccountPassword, listTextPassword } from "../_actions";
import getQueryClient from "../getQueryClient";
import Hydrate from "@/lib/client/Hydrate";

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.fetchQuery(["listTextPassword", { search: "" }], () =>
    listTextPassword({ search: "" }),
  );

  await queryClient.fetchQuery(["listAccountPassword", { search: "" }], () =>
    listAccountPassword({ search: "" }),
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <Tabs />
    </Hydrate>
  );
}
