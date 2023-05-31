"use client";

import { useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { cx } from "classix";

import {
  createTextPassword,
  deleteTextPassword,
  updateTextPassword,
} from "../_actions";
import { Dialog } from "@/components/Dialog";
import { useAction } from "@/lib/action/client";
import { useMe } from "@/lib/client/MeProvider";
import { useSensitiveQuery } from "@/lib/client/useSensitive";
import { TextPasswordDO } from "@/lib/models";
import { getPersistHasedPassword, toSensitive } from "@/lib/Sensitive";

export const TextPasswordDialog: React.FC<{
  textPassword?: TextPasswordDO;
  open: boolean;
  onClose: () => void;
}> = ({ textPassword, open, onClose }) => {
  const createAction = useAction(createTextPassword);
  const updateAction = useAction(updateTextPassword);
  const deleteAction = useAction(deleteTextPassword);

  const clearErrors = () => {
    createAction.clearErrors();
    updateAction.clearErrors();
  };

  const refresh = () => {
    queryClient.invalidateQueries(["listTextPasswords"]);
  };

  const { me } = useMe();

  const queryClient = useQueryClient();

  const textDecrypted = useSensitiveQuery(textPassword?.text!, {
    enabled: !!textPassword,
  });

  const urlRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={textPassword ? "Edit Text Password" : "Create Text Password"}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.stopPropagation();
          e.preventDefault();

          if (textPassword) {
            await updateAction.execute({
              id: textPassword.id,
              url: urlRef.current!.value,
              name: nameRef.current!.value,
              text: await toSensitive(
                getPersistHasedPassword()!,
                me.nonce,
                textRef.current!.value,
              ),
              type: "TEXT",
            });
          } else {
            await createAction.execute({
              url: urlRef.current!.value,
              name: nameRef.current!.value,
              text: await toSensitive(
                getPersistHasedPassword()!,
                me.nonce,
                textRef.current!.value,
              ),
              type: "TEXT",
            });
          }

          onClose();
          refresh();
        }}
      >
        <input
          className={cx("input input-bordered")}
          placeholder="URL"
          type="url"
          name="url"
          ref={urlRef}
          defaultValue={textPassword?.url}
          onChange={clearErrors}
        />

        <input
          className={cx("input input-bordered")}
          placeholder="Name"
          type="text"
          name="name"
          ref={nameRef}
          defaultValue={textPassword?.name}
          onChange={clearErrors}
        />

        {textPassword != null && textDecrypted.data != null && (
          <input
            className={cx("input input-bordered")}
            placeholder="Text"
            type="text"
            name="text"
            ref={textRef}
            defaultValue={textDecrypted.data}
            onChange={clearErrors}
          />
        )}

        {textPassword == null && (
          <input
            className={cx("input input-bordered")}
            placeholder="Text"
            type="text"
            name="text"
            ref={textRef}
            onChange={clearErrors}
          />
        )}

        <div className="flex gap-x-4">
          <button
            className={cx(
              "btn btn-primary",
              (createAction.loading || updateAction.loading) && "loading",
            )}
            type="submit"
          >
            {textPassword ? "EDIT" : "CREATE"}
          </button>

          {textPassword && (
            <button
              className={cx("btn btn-error", deleteAction.loading && "loading")}
              type="button"
              onClick={() =>
                deleteAction
                  .execute(textPassword.id)
                  .then(refresh)
                  .then(onClose)
              }
            >
              DELETE
            </button>
          )}

          <button className="btn" onClick={onClose} type="button">
            CANCEL
          </button>
        </div>
      </form>
    </Dialog>
  );
};
