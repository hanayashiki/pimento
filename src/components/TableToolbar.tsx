"use client";

import { VscAdd } from "react-icons/vsc";

export const TableToolbar = ({
  search,
  setSearch,
  onClickAdd,
}: {
  search: string;
  setSearch: (value: string) => void;
  onClickAdd: () => void;
}) => {
  return (
    <div className="mb-8 flex gap-x-4">
      <input
        type="text"
        placeholder="Search here"
        className="input input-bordered w-full max-w-xs"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button className="hover:text-primary" onClick={() => onClickAdd()}>
        <VscAdd />
      </button>
    </div>
  );
};
