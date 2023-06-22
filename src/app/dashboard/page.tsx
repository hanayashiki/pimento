import { dehydrate } from "@tanstack/query-core";

import Tabs from "./Tabs";
import {
  listAccountPassword,
  listPaymentCard,
  listTextPassword,
} from "../_actions";
import getQueryClient from "../getQueryClient";
import Hydrate from "@/lib/client/Hydrate";

export default async function Page({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const queryClient = getQueryClient();

  const { type = "TextPassword" } = searchParams;

  await Promise.all([
    type === "TextPassword" &&
      queryClient.fetchQuery({
        queryKey: ["listTextPassword", { search: "", orders: [] }],
        queryFn: () => listTextPassword({ search: "", orders: [] }),
      }),
    type === "AccountPassword" &&
      queryClient.fetchQuery({
        queryKey: ["listAccountPassword", { search: "", orders: [] }],
        queryFn: () => listAccountPassword({ search: "", orders: [] }),
      }),
    type === "PaymentCard" &&
      queryClient.fetchQuery({
        queryKey: ["listPaymentCard", { search: "", orders: [] }],
        queryFn: () => listPaymentCard({ search: "", orders: [] }),
      }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <Tabs />
    </Hydrate>
  );
}
