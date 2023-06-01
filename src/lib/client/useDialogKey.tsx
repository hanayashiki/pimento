import { useEffect, useState } from "react";

let i = 0;

export const useDialogKey = (open: boolean) => {
  const [id] = useState(i++);

  const [deferred, setDeferred] = useState(open);

  useEffect(() => {
    setTimeout(() => setDeferred(open), 100);
  }, [open]);

  return String(deferred) + id;
};
