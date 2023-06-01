"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { VscEdit } from "react-icons/vsc";

import { TextPasswordDialog } from "./TextPasswordDialog";
import { listTextPassword } from "../_actions";
import { SensitiveDisplay } from "@/components/SensitiveDisplay";
import { TableToolbar } from "@/components/TableToolbar";
import { useDialogKey } from "@/lib/client/useDialogKey";
import { PasswordSearch, TextPasswordDO } from "@/lib/models";

const TextPasswordTable = () => {
  const [search, setSearch] = useState("");

  const [editTarget, setEditTarget] = useState<TextPasswordDO>();
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const passwordSearch: PasswordSearch = {
    search,
  };

  const { data, isPreviousData } = useQuery({
    queryKey: ["listTextPassword", passwordSearch],
    queryFn: () => listTextPassword(passwordSearch),
    keepPreviousData: true,
  });

  const [visibleIds, setVisibleIds] = useState<number[]>([]);

  return (
    <div className="flex flex-col shrink overflow-hidden">
      <TableToolbar
        search={search}
        setSearch={setSearch}
        onClickAdd={() => setAddOpen(true)}
      />

      <div className="overflow-auto shrink">
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
              <th>TEXT</th>
              <th>CREATED</th>
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
