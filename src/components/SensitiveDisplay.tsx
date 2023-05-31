"use client";

import React from "react";

import { VscEye, VscEyeClosed } from "react-icons/vsc";

import { useSensitiveQuery } from "@/lib/client/useSensitive";
import { Sensitive } from "@/lib/Sensitive";

export const SensitiveDisplay = ({
  sensitive,
  visible,
  onChangeVisible,
}: {
  sensitive: Sensitive;
  visible: boolean;
  onChangeVisible: (v: boolean) => void;
}) => {
  const decryptQuery = useSensitiveQuery(sensitive);

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
