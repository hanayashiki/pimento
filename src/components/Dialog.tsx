import { useEffect, useState } from "react";

import cx from "classix";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}

export const Dialog = ({ open, title, children }: DialogProps) => {
  const [deferred, setDeferred] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setDeferred(open), 100);
    } else {
      setDeferred(false);
    }
  }, [open]);

  return (
    <div
      className={cx(
        "modal",
        deferred && "!opacity-100 !visible !pointer-events-auto",
      )}
    >
      <div className="modal-box relative">
        <h3 className="text-lg font-bold mb-[1rem]">{title}</h3>

        {children}
      </div>
    </div>
  );
};
