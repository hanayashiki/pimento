"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Result } from "@monoid-dev/ts-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import cx from "classix";
import { MdOutlineDelete, MdClose } from "react-icons/md";
import { VscAdd } from "react-icons/vsc";
import { usePopper } from "react-popper";
import { identity } from "remeda";
import { useDebounceCallback, useDebounceValue } from "usehooks-ts";

import * as actions from "@/app/_actions";

export const TableToolbar = ({
  type,
  search,
  setSearch,
  onClickAdd,
}: {
  type: string;
  search: string;
  setSearch: (value: string) => void;
  onClickAdd: () => void;
}) => {
  const [referenceElement, setReferenceElement] =
    useState<HTMLInputElement | null>(null);

  const [inputWidth, setInputWidth] = useState(0);

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const { styles, attributes, forceUpdate } = usePopper(
    referenceElement,
    popperElement,
    {
      placement: "bottom-start",
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 8],
          },
        },
      ],
    },
  );

  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const queryClient = useQueryClient();

  const upsertSearchHistory = useDebounceCallback(
    useCallback(
      async (text: string) => {
        await actions.upsertSearchHistory({ text, type });
        queryClient.removeQueries({
          queryKey: ["listSearchHistory"] as const,
        });
      },
      [type],
    ),
    500,
  );

  const [debouncedSearch] = useDebounceValue(search, 300);

  const listSearchHistoryQuery = useQuery({
    queryKey: ["listSearchHistory", debouncedSearch, type] as const,
    queryFn: ({ queryKey: [_, text, type] }) =>
      actions.listSearchHistory({ text, type }),
    placeholderData: identity,
  });

  const listSearchHistoryItems = useMemo(
    () =>
      Result.unwrapOr(listSearchHistoryQuery.data ?? Result.ofRight([]), []),
    [listSearchHistoryQuery.data],
  );

  useEffect(() => {
    if (referenceElement) {
      const ob = new ResizeObserver(() => {
        setInputWidth(referenceElement.getBoundingClientRect().width);
      });

      ob.observe(referenceElement);

      return () => ob.disconnect();
    }
  }, [referenceElement]);

  useEffect(() => {
    function handleClick(ev: MouseEvent) {
      if (ev.target instanceof HTMLElement) {
        if (
          !referenceElement?.contains(ev.target) &&
          !popperElement?.contains(ev.target)
        ) {
          setOpen(false);
          upsertSearchHistory(search);
        }
      }
    }

    if (open) {
      window.addEventListener("click", handleClick);

      return () => {
        window.removeEventListener("click", handleClick);
      };
    }
  }, [referenceElement, popperElement, search, open]);

  useEffect(() => {
    if (focusedIndex > listSearchHistoryItems.length - 1) {
      setFocusedIndex(0);
    }
  }, [listSearchHistoryItems]);

  return (
    <div className="mb-5 sm:mb-8 flex gap-x-4">
      <input
        ref={setReferenceElement}
        type="text"
        placeholder="Search here"
        className="input input-bordered w-full sm:max-w-xs !outline-none focus:border-accent"
        value={search}
        onFocus={() => {
          requestAnimationFrame(() => {
            forceUpdate?.();
            referenceElement?.select();
            setOpen(true);
          });
        }}
        onChange={(e) => {
          setOpen(true);
          setSearch(e.target.value);
          forceUpdate?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            setFocusedIndex((i) => (i + 1) % listSearchHistoryItems.length);
          } else if (e.key === "ArrowUp") {
            setFocusedIndex(
              (i) =>
                (i - 1 + listSearchHistoryItems.length) %
                listSearchHistoryItems.length,
            );
          } else if (e.key === "Enter") {
            const focusedItem = listSearchHistoryItems[focusedIndex];
            if (focusedItem) {
              setOpen(false);
              setSearch(focusedItem.text);
              upsertSearchHistory(focusedItem.text);
            }
          }
        }}
      />

      <div
        ref={setPopperElement}
        role="autocomplete"
        className={cx(
          (!open ||
            listSearchHistoryItems.every((item) => item.text === search)) &&
            "hidden",
          "p-4 bg-gray-800 z-50 rounded-lg shadow-md",
        )}
        style={{
          ...styles.popper,
          width: inputWidth,
        }}
        {...attributes.popper}
      >
        <div className="flex flex-col gap-y-[0.5rem]">
          {listSearchHistoryItems.map((item, i) => (
            <a
              key={i}
              className={cx(
                i !== listSearchHistoryItems.length - 1 && "mb-[0.5rem]",
                "hover:text-accent cursor-pointer",
                i === focusedIndex && "text-accent",
              )}
              onClick={() => {
                setSearch(item.text);
                setOpen(false);
                upsertSearchHistory(item.text);
              }}
            >
              {item.text}
            </a>
          ))}
        </div>

        <button
          className="mt-[1.75rem] text-red-500"
          onClick={async () => {
            setOpen(false);
            await actions.deleteAllSearchHistory();
            queryClient.invalidateQueries({
              queryKey: ["listSearchHistory"] as const,
            });
          }}
        >
          <MdOutlineDelete />
        </button>

        <button
          className="mt-[1.75rem] float-right"
          onClick={async () => {
            setOpen(false);
          }}
        >
          <MdClose />
        </button>
      </div>

      <button
        className="hover:text-primary [html:has(input:focus)_&]:hidden [html:has([role=autocomplete]:not(.hidden))_&]:hidden sm:!block"
        onClick={() => onClickAdd()}
      >
        <VscAdd />
      </button>
    </div>
  );
};
