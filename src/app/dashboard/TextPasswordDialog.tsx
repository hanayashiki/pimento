import { useRef, useState } from "react";

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
import { getPersistHashedPassword, toSensitive } from "@/lib/Sensitive";

export const TextPasswordDialog: React.FC<{
  password?: TextPasswordDO;
  open: boolean;
  onClose: () => void;
}> = ({ password, open, onClose }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createAction = useAction(createTextPassword);
  const updateAction = useAction(updateTextPassword);
  const deleteAction = useAction(deleteTextPassword);

  const clearErrors = () => {
    createAction.clearErrors();
    updateAction.clearErrors();
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["listTextPassword"] });
  };

  const { me } = useMe();

  const queryClient = useQueryClient();

  const textDecrypted = useSensitiveQuery(password?.text!, {
    enabled: !!password,
  });

  const urlRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={password ? "Edit Text Password" : "Create Text Password"}
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
              text: await toSensitive(
                getPersistHashedPassword()!,
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
                getPersistHashedPassword()!,
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

        {password != null && textDecrypted.data != null && (
          <textarea
            className={cx("textarea textarea-bordered")}
            placeholder="Text"
            name="text"
            ref={textRef}
            defaultValue={textDecrypted.data}
            onChange={clearErrors}
          />
        )}

        {password == null && (
          <textarea
            className={cx("textarea textarea-bordered")}
            placeholder="Text"
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
