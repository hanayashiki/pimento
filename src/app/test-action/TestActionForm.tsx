"use client";

import { testThrowError } from "@/app/_actions";
import { useAction } from "@/lib/action/client";

export function TestActionForm() {
  const { execute } = useAction(testThrowError);

  return <button onClick={() => execute({}).then(console.info)}>test</button>;
}
