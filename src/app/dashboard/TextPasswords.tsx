"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { VscAdd, VscEdit } from "react-icons/vsc";

import { TextPasswordDialog } from "./TextPasswordDialog";
import { listTextPasswords } from "../_actions";
import { SensitiveDisplay } from "@/components/SensitiveDisplay";
import { PasswordSearch, TextPasswordDO } from "@/lib/models";

const TextPasswords = () => {
  const [search, setSearch] = useState("");

  const [editTarget, setEditTarget] = useState<TextPasswordDO>();
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const passwordSearch: PasswordSearch = {
    search,
  };

  const { data, isPreviousData } = useQuery({
    queryKey: ["listTextPasswords", passwordSearch],
    queryFn: () => listTextPasswords(passwordSearch),
    keepPreviousData: true,
  });

  const [visibleIds, setVisibleIds] = useState<number[]>([]);

  return (
    <div>
      <div className="mb-8 flex gap-x-4">
        <input
          type="text"
          placeholder="Search here"
          className="input input-bordered w-full max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="hover:text-primary" onClick={() => setAddOpen(true)}>
          <VscAdd />
        </button>
      </div>

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
              <th>TEXT</th>
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

      <TextPasswordDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <TextPasswordDialog
        textPassword={editTarget}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
        }}
      />
    </div>
  );
};

export default TextPasswords;
