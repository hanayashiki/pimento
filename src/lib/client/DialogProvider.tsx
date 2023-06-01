"use client";

import React, { useContext, useState } from "react";

import { cx } from "classix";

import { Dialog } from "@/components/Dialog";

export interface DialogMessage {
  title: string;
  message: string;
  buttons: {
    title: string;
    className?: string;
    action: () => void;
  }[];
}

export type DialogProviderContextValue = {
  message?: DialogMessage;
  setMessage: (value: DialogMessage) => void;
};

export const DialogContext = React.createContext<DialogProviderContextValue>(
  undefined as any,
);

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<DialogMessage | undefined>(undefined);
  const [open, setOpen] = useState(false);

  return (
    <DialogContext.Provider
      value={{
        message,
        setMessage: (value) => {
          setMessage(value);
          setOpen(true);
        },
      }}
    >
      {message && (
        <Dialog
          title={message.title}
          open={open}
          onClose={() => setOpen(false)}
        >
          {message.message}

          <div className="mt-[2rem] flex gap-3">
            {message.buttons.map((button, i) => (
              <button
                className={cx("btn", button.className)}
                key={i}
                onClick={() => {
                  button.action();
                  setOpen(false);
                }}
              >
                {button.title}
              </button>
            ))}
          </div>
        </Dialog>
      )}
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const dialogContext = useContext(DialogContext);
  return {
    async confirmMessage(message: Pick<DialogMessage, "title" | "message">) {
      return new Promise<boolean>((resolve) => {
        dialogContext.setMessage({
          ...message,
          buttons: [
            {
              title: "OK",
              className: "btn-error",
              action: () => resolve(true),
            },
            {
              title: "Cancel",
              action: () => resolve(false),
            },
          ],
        });
      });
    },
  };
};
