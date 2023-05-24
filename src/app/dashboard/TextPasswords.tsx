"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { listTextPasswords } from "../_actions";
import { SensitiveDisplay } from "@/components/SensitiveDisplay";

const TextPasswords = () => {
  const { data } = useQuery({
    queryKey: ["listTextPasswords"],
    queryFn: listTextPasswords,
  });

  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const visibleId = params.getAll("visible");

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
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
          {data?.map((password, i) => (
            <tr key={password.id}>
              <td>{i + 1}</td>
              <td>{password.url}</td>
              <td>{password.name}</td>
              <td className="min-w-[100px]">
                <SensitiveDisplay
                  visible={visibleId.includes(String(password.id))}
                  onChangeVisible={() => {
                    const currentParams = new URLSearchParams();
                    const nextVisible = visibleId.includes(String(password.id))
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
    </div>
  );
};

export default TextPasswords;
