import { useState } from "react";

import { PasswordOrder } from "../models";

export interface Orders {
  orders: PasswordOrder[];
  toggleOrder: (name: string) => void;
}

export const useOrders = (): Orders => {
  const [orders, setOrders] = useState<PasswordOrder[]>([]);

  return {
    orders,
    toggleOrder(key) {
      const currentOrder = orders.find((o) => o.key === key);
      if (!currentOrder) {
        setOrders((o) => [
          {
            key,
            orderBy: "asc",
          },
          ...o,
        ]);
      } else {
        setOrders((o) => [
          ...(currentOrder.orderBy === "asc"
            ? [
                {
                  key,
                  orderBy: "desc",
                } satisfies PasswordOrder,
              ]
            : []),
          ...o.filter((o) => o.key !== key),
        ]);
      }
    },
  };
};
