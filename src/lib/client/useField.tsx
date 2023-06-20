import { useEffect, useRef } from "react";

export interface FieldOptions {
  onChange?(v: string): void;
}

export interface Field {
  ref: React.RefObject<HTMLInputElement>;
  value: string;
  setValue(v: string): void;
  onChange?(v: any): void;
}

export const useField = ({ onChange }: FieldOptions = {}): Field => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange?.(ref.current?.value ?? "");
  }, []);

  return {
    ref,
    get value() {
      return ref.current?.value ?? "";
    },
    setValue(v: string) {
      const oldV = ref.current!.value;
      ref.current!.value = v;

      if (v !== oldV) {
        onChange?.(v);
      }
    },
    onChange: (e: any) => onChange?.(e.target.value),
  };
};
