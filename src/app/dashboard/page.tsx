import { dehydrate } from "@tanstack/query-core";

import Tabs from "./Tabs";
import {
  listAccountPassword,
  listPaymentCard,
  listTextPassword,
} from "../_actions";
import getQueryClient from "../getQueryClient";
import Hydrate from "@/lib/client/Hydrate";

export default async function Page() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["listTextPassword", { search: "" }],
      queryFn: () => listTextPassword({ search: "" }),
    }),
    queryClient.fetchQuery({
      queryKey: ["listAccountPassword", { search: "" }],
      queryFn: () => listAccountPassword({ search: "" }),
    }),
    queryClient.fetchQuery({
      queryKey: ["listPaymentCard", { search: "" }],
      queryFn: () => listPaymentCard({ search: "" }),
    }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <Tabs />
    </Hydrate>
  );
}
