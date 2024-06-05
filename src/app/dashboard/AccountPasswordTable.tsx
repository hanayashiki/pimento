"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { cx } from "classix";
import dayjs from "dayjs";
import { VscEdit, VscAccount, VscLock, VscEye } from "react-icons/vsc";
import { useDebounceValue } from "usehooks-ts";
import { z } from "zod";

import { AccountPasswordDialog } from "./AccountPasswordDialog";
import { listAccountPassword } from "../_actions";
import { ClientOnly } from "@/components/ClientOnly";
import { OrderButton } from "@/components/OrderButton";
import { SensitiveDisplay } from "@/components/SensitiveDisplay";
import { TableToolbar } from "@/components/TableToolbar";
import { useDialogKey } from "@/lib/client/useDialogKey";
import { useLocalStorageState } from "@/lib/client/useLocalStorageState";
import { useOrders } from "@/lib/client/useOrders";
import { useSensitiveQuery } from "@/lib/client/useSensitive";
import { AccountPasswordDO, PasswordSearch } from "@/lib/models";

const MobileAccountPasswordDisplay: React.FC<{
  item: AccountPasswordDO;
  visible: boolean;
  onChangeVisible: (v: boolean) => void;
}> = ({ item, visible, onChangeVisible }) => {
  const { data: username } = useSensitiveQuery(item.username);
  const { data: password } = useSensitiveQuery(item.password);

  return (
    <div className="grid grid-cols-[auto,1fr] gap-4">
      <button onClick={() => onChangeVisible(!visible)}>
        {!visible ? <VscEye /> : <VscAccount />}
      </button>
      <div
        onDoubleClick={(e) => {
          window.getSelection()?.selectAllChildren(e.currentTarget);
        }}
      >
        {visible ? username : "****"}
      </div>

      <button onClick={() => onChangeVisible(!visible)}>
        {!visible ? <VscEye /> : <VscLock />}
      </button>
      <div
        onDoubleClick={(e) => {
          window.getSelection()?.selectAllChildren(e.currentTarget);
        }}
      >
        {visible ? password : "****"}
      </div>
    </div>
  );
};

const AccountPasswordTable: React.FC<{ active: boolean }> = ({ active }) => {
  const [search, setSearch] = useLocalStorageState(
    "AccountPasswordTable.search",
    z.string(),
    "",
  );

  const [editTarget, setEditTarget] = useState<AccountPasswordDO>();
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const orders = useOrders();

  const [debouncedSearch] = useDebounceValue(search, 500);

  const passwordSearch: PasswordSearch = {
    search: debouncedSearch,
    orders: orders.orders,
  };

  const { data, isPlaceholderData } = useQuery({
    queryKey: ["listAccountPassword", passwordSearch] as const,
    queryFn: ({ queryKey: [_, q] }) => listAccountPassword(q),
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
        type="AccountPassword"
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
                URL <OrderButton orderKey="url" orders={orders} />
              </th>
              <th>
                NAME <OrderButton orderKey="name" orders={orders} />
              </th>
              <th>USERNAME</th>
              <th>PASSWORD</th>
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
                    {password.url && (
                      <a
                        href={password.url}
                        className="link link-accent"
                        target="blank"
                      >
                        {password.url}
                      </a>
                    )}
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
                      sensitive={password.username}
                    />
                  </td>
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
                      sensitive={password.password}
                    />
                  </td>
                  <td>
                    <ClientOnly>
                      {dayjs(password.created_at).format("YYYY/MM/DD HH:mm")}
                    </ClientOnly>
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
              <div className="card-body !py-[1.5rem]">
                <h2 className="card-title mb-[1rem]">
                  <a
                    target="_blank"
                    className={
                      password.url ? "text-accent underline" : undefined
                    }
                    href={password.url ? password.url : undefined}
                  >
                    {password.name || password.url}
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

                <MobileAccountPasswordDisplay
                  item={password}
                  visible={visibleIds.includes(password.id)}
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
      <AccountPasswordDialog
        key={useDialogKey(addOpen)}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <AccountPasswordDialog
        password={editTarget}
        key={useDialogKey(editOpen)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
};

export default AccountPasswordTable;
