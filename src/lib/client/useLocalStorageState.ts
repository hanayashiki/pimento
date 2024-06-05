import { startTransition, useEffect, useState } from "react";

import { z } from "zod";

export const useLocalStorageState = <S extends z.ZodTypeAny>(
  key: string,
  schema: S,
  defaultValue: z.infer<S>,
): [z.infer<S>, (value: z.infer<S>) => void] => {
  const load = () => {
    const value = localStorage.getItem(key);

    if (value === null) {
      return defaultValue;
    }

    try {
      return schema.parse(JSON.parse(value));
    } catch (_) {
      return defaultValue;
    }
  };

  const [state, _setState] = useState<S>(defaultValue);

  useEffect(() => {
    startTransition(() => _setState(load()));
  }, []);

  const setState = (value: S) => {
    localStorage.setItem(key, JSON.stringify(value));
    _setState(value);
  };

  return [state, setState];
};
