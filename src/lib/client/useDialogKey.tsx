import { useDebugValue } from "react";

export const useDialogKey = (open: boolean) => {
  return String(useDebugValue(open));
};
