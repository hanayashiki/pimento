"use client";

import { useQueryClient } from "@tanstack/react-query";
import { cx } from "classix";

import { createTextPassword } from "../_actions";
import { Dialog } from "@/components/Dialog";
import { useAction } from "@/lib/action/client";
import { useMe } from "@/lib/client/MeProvider";
import { TextPasswordDO } from "@/lib/models";
import { getPersistHasedPassword, toSensitive } from "@/lib/Sensitive";

export const TextPasswordDialog: React.FC<{
  textPassword?: TextPasswordDO;
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { clearErrors, execute } = useAction(createTextPassword);
  const { me } = useMe();

  const queryClient = useQueryClient();

  return (
    <Dialog open={open} onClose={onClose} title="Create Text Password">
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.stopPropagation();
          e.preventDefault();

          (await execute({
            name: (document.getElementById("name") as HTMLInputElement)!.value,
            text: await toSensitive(
              getPersistHasedPassword()!,
              me.nonce,
              (document.getElementById("text") as HTMLInputElement)!.value,
            ),
            type: "TEXT",
            url: (document.getElementById("url") as HTMLInputElement)!.value,
          }))!;

          onClose();
          queryClient.invalidateQueries(["listTextPasswords"]);
        }}
      >
        <input
          className={cx("input input-bordered")}
          placeholder="URL"
          type="url"
          name="url"
          id="url"
          onChange={clearErrors}
        />

        <input
          className={cx("input input-bordered")}
          placeholder="Name"
          type="text"
          name="name"
          id="name"
          onChange={clearErrors}
        />

        <input
          className={cx("input input-bordered")}
          placeholder="Text"
          type="text"
          name="text"
          id="text"
          onChange={clearErrors}
        />

        <div className="flex gap-x-4">
          <button className="btn btn-primary" type="submit">
            CREATE
          </button>

          <button className="btn" onClick={onClose} type="button">
            CANCEL
          </button>
        </div>
      </form>
    </Dialog>
  );
};
