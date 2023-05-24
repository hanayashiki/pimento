"use client";

import React from "react";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { VscEye, VscEyeClosed } from "react-icons/vsc";

import { useMe } from "@/lib/client/MeProvider";
import { getPersistHasedPassword, Sensitive } from "@/lib/Sensitive";
import { fromSensitive } from "@/lib/Sensitive";

export const SensitiveDisplay = ({
  sensitive,
  visible,
  onChangeVisible,
}: {
  sensitive: Sensitive;
  visible: boolean;
  onChangeVisible: (v: boolean) => void;
}) => {
  const { me } = useMe();

  const router = useRouter();

  const decryptQuery = useQuery(
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
    },
  );

  return (
    <>
      {visible && (
        <>
          <button onClick={() => onChangeVisible(false)} className="mr-3">
            <VscEyeClosed />
          </button>

          {decryptQuery.data ?? (
            <span
              style={{
                height: "1em",
                width: "100%",
                position: "relative",
                top: 1,
              }}
              className="bg-white bg-opacity-40 rounded-sm animate-pulse inline-block"
            />
          )}
        </>
      )}
      {!visible && (
        <>
          <button onClick={() => onChangeVisible(true)} className="mr-3">
            <VscEye />
          </button>
          <span>****</span>
        </>
      )}
    </>
  );
};
