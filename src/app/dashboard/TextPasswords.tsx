"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { VscAdd } from "react-icons/vsc";

import { TextPasswordDialog } from "./TextPasswordDialog";
import { listTextPasswords } from "../_actions";
import { SensitiveDisplay } from "@/components/SensitiveDisplay";
import { PasswordSearch } from "@/lib/models";

const TextPasswords = () => {
  const params = useSearchParams();

  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);

  const passwordSearch: PasswordSearch = {
    search,
  };

  const { data, isPreviousData } = useQuery({
    queryKey: ["listTextPasswords", passwordSearch],
    queryFn: () => listTextPasswords(passwordSearch),
    keepPreviousData: true,
  });

  const router = useRouter();
  const pathname = usePathname();

  const visibleId = params.getAll("visible");

  return (
    <div className="overflow-x-auto">
      <div className="mb-8 flex gap-x-4">
        <input
          type="text"
          placeholder="Search here"
          className="input input-bordered w-full max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={() => setAddOpen(true)}>
          <VscAdd />
        </button>
      </div>

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
                <td>{i + 1}</td>
                <td>{password.url}</td>
                <td>{password.name}</td>
                <td className="min-w-[100px]">
                  <SensitiveDisplay
                    visible={visibleId.includes(String(password.id))}
                    onChangeVisible={() => {
                      const currentParams = new URLSearchParams(
                        params.toString(),
                      );
                      const nextVisible = visibleId.includes(
                        String(password.id),
                      )
                        ? visibleId.filter((i) => i !== String(password.id))
                        : [...visibleId, String(password.id)];
                      currentParams.delete("visible");
                      for (const v of nextVisible) {
                        currentParams.append("visible", v);
                      }
                      router.push(`${pathname}/?${currentParams.toString()}`, {
                        forceOptimisticNavigation: true,
                      });
                    }}
                    sensitive={password.text}
                  />
                </td>
                <td>{password.created_at}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <TextPasswordDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
};

export default TextPasswords;
