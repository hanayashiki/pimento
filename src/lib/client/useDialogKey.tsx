import { useEffect, useState } from "react";

export const useDialogKey = (open: boolean) => {
  const [deferred, setDeferred] = useState(open);

  useEffect(() => {
    setTimeout(() => setDeferred(open), 100);
  }, [open]);

  return String(deferred);
};
