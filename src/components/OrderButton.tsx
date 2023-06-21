import cx from "classix";

import { Orders } from "@/lib/client/useOrders";

export interface OrderButtonProps {
  orderKey: string;
  orders: Orders;
}

export const OrderButton = ({ orderKey, orders }: OrderButtonProps) => {
  const L = 16;
  const a = 2;
  const b = 2;

  const halfSide = (L - 2 * a - b) / (2 * Math.sqrt(3));

  const currentOrder = orders.orders.find((o) => o.key === orderKey);

  return (
    <button
      className="align-middle"
      onClick={() => orders.toggleOrder(orderKey)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${L} ${L}`}
        width={L}
        height={L}
      >
        <polygon
          points={`${L / 2} ${a}, ${L / 2 + halfSide} ${(L - b) / 2}, ${
            L / 2 - halfSide
          } ${(L - b) / 2}`}
          className={cx(
            currentOrder?.orderBy === "asc" ? "fill-accent" : "fill-gray-500",
          )}
        />

        <polygon
          points={`${L / 2} ${L - a}, ${L / 2 + halfSide} ${(L - b) / 2 + b}, ${
            L / 2 - halfSide
          } ${(L - b) / 2 + b}`}
          className={cx(
            currentOrder?.orderBy === "desc" ? "fill-accent" : "fill-gray-500",
          )}
        />
      </svg>
    </button>
  );
};
