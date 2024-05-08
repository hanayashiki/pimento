"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { cx } from "classix";
import dayjs from "dayjs";
import { VscEdit } from "react-icons/vsc";
import { VscEye, VscEyeClosed } from "react-icons/vsc";

import { PaymentCardDialog } from "./PaymentCardDialog";
import { listPaymentCard } from "../_actions";
import { OrderButton } from "@/components/OrderButton";
import { TableToolbar } from "@/components/TableToolbar";
import { useDialogKey } from "@/lib/client/useDialogKey";
import { useOrders } from "@/lib/client/useOrders";
import { useSensitiveQuery } from "@/lib/client/useSensitive";
import { formatPan, paymentCardMetaMap } from "@/lib/data/paymentCard";
import { PasswordSearch, PaymentCardDO } from "@/lib/models";

const CardNumberDisplay = ({
  visible,
  onChangeVisible,
  password,
}: {
  visible: boolean;
  onChangeVisible: (v: boolean) => void;
  password: PaymentCardDO;
}) => {
  const { data: pan } = useSensitiveQuery(password.pan);
  const { data: cvv } = useSensitiveQuery(password.cvv);
  const { data: expirationDate } = useSensitiveQuery(password.expirationDate);
  const { data: cardholder } = useSensitiveQuery(password.cardholder);

  const meta =
    password.brand !== "Other" ? paymentCardMetaMap[password.brand] : undefined;

  return (
    <div className="pt-[5px] pr-[20px]">
      <div className="flex">
        {meta && (
          <img
            src={meta.darkImage.src}
            height={57 / 2}
            width={72 / 2}
            className="relative top-[-2px] inline mr-4"
          />
        )}

        <button
          onClick={() => onChangeVisible(true)}
          className="mr-3 hover:text-accent relative top-[-3px]"
        >
          {!visible ? <VscEye /> : <VscEyeClosed />}
        </button>

        {!visible && (
          <div>
            <span>**** {password.lastDigits}</span>
          </div>
        )}
      </div>

      {visible && (
        <div className="mt-[0.25rem] sm:text-sm">
          <span
            className="sm:text-base text-lg"
            onDoubleClick={(e) => {
              window.getSelection()?.selectAllChildren(e.currentTarget);
            }}
          >
            {meta ? formatPan(0, pan ?? "", meta.rules)[1] : pan}
          </span>

          <br />
          <span onDoubleClick={(e) => {
              window.getSelection()?.selectAllChildren(e.currentTarget);
            }}
          >
            {expirationDate}
          </span>
          <br />
          <span onDoubleClick={(e) => {
              window.getSelection()?.selectAllChildren(e.currentTarget);
            }}
          >
            {cardholder}
          </span>

          <br />

          <span onDoubleClick={(e) => {
              window.getSelection()?.selectAllChildren(e.currentTarget);
            }}
          >
            {cvv}
          </span>
        </div>
      )}
    </div>
  );
};

const PaymentCardTable: React.FC<{ active: boolean }> = ({ active }) => {
  const [search, setSearch] = useState("");

  const [editTarget, setEditTarget] = useState<PaymentCardDO>();
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const orders = useOrders();

  const passwordSearch: PasswordSearch = {
    search,
    orders: orders.orders,
  };

  const { data, isPlaceholderData } = useQuery({
    queryKey: ["listPaymentCard", passwordSearch],
    queryFn: () => listPaymentCard(passwordSearch),
    placeholderData: (data) => data,
  });

  const [visibleIds, setVisibleIds] = useState<number[]>([]);

  return (
    <div
      className={cx(
        "flex flex-col shrink overflow-hidden",
        !active && "hidden",
      )}
    >
      <TableToolbar
        search={search}
        setSearch={setSearch}
        onClickAdd={() => setAddOpen(true)}
      />

      {/* Desktop */}
      <div className="overflow-auto shrink rounded-[1rem] hidden sm:block">
        <table
          className="table w-full"
          style={{ opacity: isPlaceholderData ? 0.8 : undefined }}
        >
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>
                URL
                <OrderButton orderKey="url" orders={orders} />
              </th>
              <th>
                NAME
                <OrderButton orderKey="name" orders={orders} />
              </th>
              <th>
                CARD NUMBER
                <OrderButton orderKey="brand" orders={orders} />
              </th>
              <th>
                CREATED <OrderButton orderKey="created_at" orders={orders} />
              </th>
            </tr>
          </thead>
          <tbody>
            {data?._tag === "Right" &&
              data.right.map((password, i) => (
                <tr key={password.id}>
                  <th>
                    {i + 1}

                    <button
                      className="ml-[1rem] relative top-[2px] hover:text-primary"
                      onClick={() => {
                        setEditTarget(password);
                        setEditOpen(true);
                      }}
                    >
                      <VscEdit />
                    </button>
                  </th>
                  <td>
                    <a
                      href={password.url}
                      className="link link-accent"
                      target="blank"
                    >
                      {password.url}
                    </a>
                  </td>
                  <td>{password.name}</td>
                  <td className="min-w-[100px]">
                    <CardNumberDisplay
                      visible={visibleIds.includes(password.id)}
                      password={password}
                      onChangeVisible={() => {
                        setVisibleIds(
                          visibleIds.includes(password.id)
                            ? visibleIds.filter((i) => i !== password.id)
                            : [...visibleIds, password.id],
                        );
                      }}
                    />
                  </td>
                  <td>
                    {dayjs(password.created_at).format("YYYY/MM/DD HH:mm")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="overflow-auto shrink rounded-[1rem] sm:hidden flex flex-col gap-y-[1rem]">
        {data?._tag === "Right" &&
          data.right.map((password) => (
            <div className="card bg-base-300 shadow-xl" key={password.id}>
              <div className="card-body">
                <h2 className="card-title mb-[0.5rem]">
                  <a
                    target="_blank"
                    className={
                      password.url ? "text-accent underline" : undefined
                    }
                    href={password.url ? password.url : undefined}
                  >
                    {password.name}
                  </a>

                  <div className="flex-1" />
                  <button
                    className="ml-[1rem] hover:text-primary"
                    onClick={() => {
                      setEditTarget(password);
                      setEditOpen(true);
                    }}
                  >
                    <VscEdit />
                  </button>
                </h2>

                <CardNumberDisplay
                  visible={visibleIds.includes(password.id)}
                  password={password}
                  onChangeVisible={() => {
                    setVisibleIds(
                      visibleIds.includes(password.id)
                        ? visibleIds.filter((i) => i !== password.id)
                        : [...visibleIds, password.id],
                    );
                  }}
                />

              </div>
            </div>
          ))}
      </div>

      <PaymentCardDialog
        key={useDialogKey(addOpen)}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <PaymentCardDialog
        key={useDialogKey(editOpen)}
        password={editTarget}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
        }}
      />
    </div>
  );
};

export default PaymentCardTable;
