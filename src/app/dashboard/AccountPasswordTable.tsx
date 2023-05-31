"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { VscEdit } from "react-icons/vsc";

import { AccountPasswordDialog } from "./AccountPasswordDialog";
import { listAccountPassword } from "../_actions";
import { SensitiveDisplay } from "@/components/SensitiveDisplay";
import { TableToolbar } from "@/components/TableToolbar";
import { useDialogKey } from "@/lib/client/useDialogKey";
import { AccountPasswordDO, PasswordSearch } from "@/lib/models";

const AccountPasswordTable = () => {
  const [search, setSearch] = useState("");

  const [editTarget, setEditTarget] = useState<AccountPasswordDO>();
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const passwordSearch: PasswordSearch = {
    search,
  };

  const { data, isPreviousData } = useQuery({
    queryKey: ["listAccountPassword", passwordSearch],
    queryFn: () => listAccountPassword(passwordSearch),
    keepPreviousData: true,
  });

  const [visibleIds, setVisibleIds] = useState<number[]>([]);

  return (
    <div>
      <TableToolbar
        search={search}
        setSearch={setSearch}
        onClickAdd={() => setAddOpen(true)}
      />

      <div className="overflow-x-auto">
        <table
          className="table w-full"
          style={{ opacity: isPreviousData ? 0.8 : undefined }}
        >
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>URL</th>
              <th>NAME</th>
              <th>USERNAME</th>
              <th>PASSWORD</th>
              <th>CREATED</th>
            </tr>
          </thead>
          <tbody>
            {data?._tag === "Right" &&
              data.right.map((password, i) => (
                <tr key={password.id}>
                  <td>
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
                  </td>
                  <td>{password.url}</td>
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
                    {dayjs(password.created_at).format("YYYY/MM/DD HH:mm")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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