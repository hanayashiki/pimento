"use client";

import { useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { cx } from "classix";

import {
  createAccountPassword,
  deleteAccountPassword,
  updateAccountPassword,
} from "../_actions";
import { Dialog } from "@/components/Dialog";
import { useAction } from "@/lib/action/client";
import { useMe } from "@/lib/client/MeProvider";
import { useSensitiveQuery } from "@/lib/client/useSensitive";
import { AccountPasswordDO } from "@/lib/models";
import { getPersistHashedPassword, toSensitive } from "@/lib/Sensitive";

export const AccountPasswordDialog: React.FC<{
  password?: AccountPasswordDO;
  open: boolean;
  onClose: () => void;
}> = ({ password, open, onClose }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createAction = useAction(createAccountPassword);
  const updateAction = useAction(updateAccountPassword);
  const deleteAction = useAction(deleteAccountPassword);

  const clearErrors = () => {
    createAction.clearErrors();
    updateAction.clearErrors();
  };

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["listAccountPassword"],
    });
  };

  const { me } = useMe();

  const queryClient = useQueryClient();

  const usernameDecrypted = useSensitiveQuery(password?.username!, {
    enabled: !!password,
  });

  const passwordDecrypted = useSensitiveQuery(password?.password!, {
    enabled: !!password,
  });

  const urlRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={password ? "Edit Account Password" : "Create Account Password"}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.stopPropagation();
          e.preventDefault();

          if (password) {
            await updateAction.execute({
              id: password.id,
              url: urlRef.current!.value,
              name: nameRef.current!.value,
              username: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                usernameRef.current!.value,
              ),
              password: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                passwordRef.current!.value,
              ),
              type: "ACCOUNT",
            });
          } else {
            await createAction.execute({
              url: urlRef.current!.value,
              name: nameRef.current!.value,
              username: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                usernameRef.current!.value,
              ),
              password: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                passwordRef.current!.value,
              ),
              type: "ACCOUNT",
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
          defaultValue={password?.url}
          onChange={clearErrors}
        />

        <input
          className={cx("input input-bordered")}
          placeholder="Name"
          type="text"
          name="name"
          ref={nameRef}
          defaultValue={password?.name}
          onChange={clearErrors}
        />

        {password != null && usernameDecrypted.data != null && (
          <input
            className={cx("input input-bordered")}
            placeholder="Username"
            type="text"
            name="text"
            ref={usernameRef}
            defaultValue={usernameDecrypted.data}
            onChange={clearErrors}
          />
        )}

        {password != null && passwordDecrypted.data != null && (
          <input
            className={cx("input input-bordered")}
            placeholder="Password"
            type="text"
            name="text"
            ref={passwordRef}
            defaultValue={passwordDecrypted.data}
            onChange={clearErrors}
          />
        )}

        {password == null && (
          <input
            className={cx("input input-bordered")}
            placeholder="Username"
            type="text"
            name="text"
            ref={usernameRef}
            onChange={clearErrors}
          />
        )}

        {password == null && (
          <input
            className={cx("input input-bordered")}
            placeholder="Password"
            type="text"
            name="text"
            ref={passwordRef}
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
            {password ? "EDIT" : "CREATE"}
          </button>

          {password &&
            (confirmDelete ? (
              <button
                className={cx(
                  "btn btn-error",
                  deleteAction.loading && "loading",
                )}
                type="button"
                onClick={() =>
                  deleteAction.execute(password.id).then(refresh).then(onClose)
                }
              >
                CONFIRM DELETE
              </button>
            ) : (
              <button
                className={"btn btn-error"}
                type="button"
                onClick={() => setConfirmDelete(true)}
              >
                DELETE
              </button>
            ))}

          <button className="btn" onClick={onClose} type="button">
            CANCEL
          </button>
        </div>
      </form>
    </Dialog>
  );
};
