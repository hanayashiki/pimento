"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { cx } from "classix";
import dayjs from "dayjs";
import { VscEdit } from "react-icons/vsc";
import { useDebounceValue } from "usehooks-ts";

import { TextPasswordDialog } from "./TextPasswordDialog";
import { listTextPassword } from "../_actions";
import { OrderButton } from "@/components/OrderButton";
import { SensitiveDisplay } from "@/components/SensitiveDisplay";
import { TableToolbar } from "@/components/TableToolbar";
import { useDialogKey } from "@/lib/client/useDialogKey";
import { useOrders } from "@/lib/client/useOrders";
import { PasswordSearch, TextPasswordDO } from "@/lib/models";

const TextPasswordTable: React.FC<{ active: boolean }> = ({ active }) => {
  const [search, setSearch] = useState("");

  const [editTarget, setEditTarget] = useState<TextPasswordDO>();
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const orders = useOrders();

  const [debouncedSearch] = useDebounceValue(search, 100);

  const passwordSearch: PasswordSearch = {
    search: debouncedSearch,
    orders: orders.orders,
  };

  const { data, isPlaceholderData } = useQuery({
    queryKey: ["listTextPassword", passwordSearch],
    queryFn: () => listTextPassword(passwordSearch),
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
        type="TextPassword"
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
              <th>TEXT</th>
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
                    <SensitiveDisplay
                      visible={visibleIds.includes(password.id)}
                      onChangeVisible={() => {
                        setVisibleIds(
                          visibleIds.includes(password.id)
                            ? visibleIds.filter((i) => i !== password.id)
                            : [...visibleIds, password.id],
                        );
                      }}
                      sensitive={password.text}
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
                <h2 className="card-title mb-[1rem]">
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
                <p className="whitespace-pre-wrap overflow-auto">
                  <SensitiveDisplay
                    visible={visibleIds.includes(password.id)}
                    onChangeVisible={() => {
                      setVisibleIds(
                        visibleIds.includes(password.id)
                          ? visibleIds.filter((i) => i !== password.id)
                          : [...visibleIds, password.id],
                      );
                    }}
                    sensitive={password.text}
                    newLineAfterCopy
                  />
                </p>
              </div>
            </div>
          ))}
      </div>

      <TextPasswordDialog
        key={useDialogKey(addOpen)}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <TextPasswordDialog
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

export default TextPasswordTable;
