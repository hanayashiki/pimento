import { useEffect } from "react";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  Sensitive,
  fromSensitive,
  getPersistHashedPassword,
} from "../Sensitive";
import { useMe } from "@/lib/client/MeProvider";

export const useSensitiveQuery = (
  sensitive: Sensitive,
  options: Omit<
    UseQueryOptions<string, Error, string, string[]> & {
      initialData?: undefined;
      onSuccess?: (v: string) => void;
    },
    "queryKey" | "queryFn"
  > = {},
) => {
  const { me } = useMe();

  const router = useRouter();

  const result = useQuery({
    queryKey: ["sensitive", sensitive],
    queryFn: async () => {
      const hashedPassword = getPersistHashedPassword();

      if (!hashedPassword) {
        router.push("/login");
        return "";
      }
      const v = await fromSensitive(hashedPassword, me.nonce, sensitive);
      return v;
    },
    staleTime: Infinity,
    ...options,
  });

  useEffect(() => {
    if (result.data !== undefined) {
      options?.onSuccess?.(result.data);
    }
  }, [options?.onSuccess && result.data, options?.onSuccess]);

  return result;
};
