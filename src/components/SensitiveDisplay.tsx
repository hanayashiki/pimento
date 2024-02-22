"use client";

import React, { useState } from "react";

import { cx } from "classix";
import copy from "copy-to-clipboard";
import { VscEye, VscEyeClosed, VscCopy } from "react-icons/vsc";

import { useSensitiveQuery } from "@/lib/client/useSensitive";
import { Sensitive } from "@/lib/Sensitive";

export const SensitiveDisplay = ({
  sensitive,
  visible,
  onChangeVisible,
  newLineAfterCopy,
}: {
  sensitive: Sensitive;
  visible: boolean;
  onChangeVisible: (v: boolean) => void;
  newLineAfterCopy?: boolean;
}) => {
  const decryptQuery = useSensitiveQuery(sensitive);

  const [copied, setCopied] = useState(false);

  const copyButton = (
    <button
      onClick={() => {
        decryptQuery.data && copy(decryptQuery.data) && setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 100);
      }}
      className={cx("mr-3", "transition-colors", copied && "text-secondary")}
    >
      <VscCopy />
    </button>
  );

  return (
    <>
      {visible && (
        <>
          <button
            onClick={() => onChangeVisible(false)}
            className="mr-3 hover:text-accent"
          >
            <VscEyeClosed />
          </button>

          {copyButton}

          {newLineAfterCopy && <br />}

          {decryptQuery.data ?? (
            <span
              style={{
                height: "1em",
                width: "100%",
                position: "relative",
                top: 1,
              }}
              className={cx(
                "bg-white bg-opacity-40 rounded-sm animate-pulse inline-block",
                "transition-colors",
                copied && "text-secondary",
              )}
            />
          )}
        </>
      )}
      {!visible && (
        <>
          <button
            onClick={() => onChangeVisible(true)}
            className="mr-3 hover:text-accent"
          >
            <VscEye />
          </button>

          {copyButton}
          <span className={cx(copied && "text-secondary", "transition-colors")}>
            ****
          </span>
        </>
      )}
    </>
  );
};
