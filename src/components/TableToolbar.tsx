"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Result } from "@monoid-dev/ts-utils";
import { useQuery } from "@tanstack/react-query";
import cx from "classix";
import { MdOutlineDelete } from "react-icons/md";
import { VscAdd } from "react-icons/vsc";
import { usePopper } from "react-popper";
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

  const upsertSearchHistory = useDebounceCallback(
    useCallback(
      (text: string) => actions.upsertSearchHistory({ text, type }),
      [type],
    ),
    500,
  );

  const [debouncedSearch] = useDebounceValue(search, 300);

  const listSearchHistoryQuery = useQuery({
    queryKey: ["listSearchHistory", debouncedSearch, type] as const,
    queryFn: ({ queryKey: [_, text, type] }) =>
      actions.listSearchHistory({ text, type }),
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

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [referenceElement, popperElement, search]);

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
        className="input input-bordered w-full max-w-xs !outline-none focus:border-accent"
        value={search}
        onFocus={() => {
          forceUpdate?.();
          setOpen(true);
        }}
        onChange={(e) => {
          setOpen(true);
          setSearch(e.target.value);
          forceUpdate?.();

          upsertSearchHistory(e.target.value);
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
            }
          }
        }}
      />

      <div
        ref={setPopperElement}
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
              }}
            >
              {item.text}
            </a>
          ))}
        </div>

        <button
          className="mt-[0.25rem] float-right"
          onClick={async () => {
            setOpen(false);
            await actions.deleteAllSearchHistory();
            listSearchHistoryQuery.refetch();
          }}
        >
          <MdOutlineDelete />
        </button>
      </div>

      <button className="hover:text-primary" onClick={() => onClickAdd()}>
        <VscAdd />
      </button>
    </div>
  );
};
