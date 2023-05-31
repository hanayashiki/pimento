import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  Sensitive,
  fromSensitive,
  getPersistHasedPassword,
} from "../Sensitive";
import { useMe } from "@/lib/client/MeProvider";

export const useSensitiveQuery = (
  sensitive: Sensitive,
  options: { enabled?: boolean } = {},
) => {
  const { enabled = true } = options;

  const { me } = useMe();

  const router = useRouter();

  return useQuery(
    ["sensitive", sensitive],
    async () => {
      const hashedPassword = getPersistHasedPassword();

      if (!hashedPassword) {
        router.push("/login");
        return "";
      }
      const v = await fromSensitive(hashedPassword, me.nonce, sensitive);
      return v;
    },
    {
      staleTime: Infinity,
      enabled,
    },
  );
};
