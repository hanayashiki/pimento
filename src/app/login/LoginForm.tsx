"use client";

import { cx } from "classix";
import Link from "next/link";

import { login } from "@/app/_actions";
import { useAction } from "@/lib/action/client";
import { hashPassword, setPersistHashedPassword } from "@/lib/Sensitive";

export default function LoginForm() {
  const { formErrors, loading, clearErrors, execute } = useAction(login);

  return (
    <form
      className="flex flex-col card bg-gray-800 shadow-xl"
      onSubmit={async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const inputPassword = (
          document.getElementById("inputPassword") as HTMLInputElement
        ).value;

        const user = (await execute({
          email: (document.getElementById("email") as HTMLInputElement).value,
          inputPassword,
        }))!;
        setPersistHashedPassword(await hashPassword(inputPassword, user.nonce));
        location.href = "/dashboard";
      }}
      action="#"
    >
      <div className="text-accent text-3xl font-bold pt-8 flex justify-center items-center">
        Pimento
      </div>

      <div className="text-center text-accent opacity-60">
        Simple Password Manager
      </div>

      <div className="card-body">
        <input
          className={cx("input", formErrors?.email && "input-error")}
          placeholder="Email"
          type="email"
          name="email"
          id="email"
          onChange={clearErrors}
          autoComplete="current-username"
        />
        <div className="text-error text-xs">{formErrors?.email?._errors}</div>
        <input
          className={cx("input", formErrors?.inputPassword && "input-error")}
          placeholder="Password"
          type="password"
          name="inputPassword"
          id="inputPassword"
          onChange={clearErrors}
          autoComplete="current-password"
        />
        <div className="text-error text-xs">
          {formErrors?.inputPassword?._errors}
        </div>

        <div className="text-accent font-bold text-sm">
          Don't have one?{" "}
          <Link href="create-account" className="underline">
            Create Account
          </Link>
        </div>

        <div className="card-actions justify-center mt-4">
          <button className={cx("btn btn-primary", loading && "loading")}>
            Log In
          </button>
        </div>
      </div>
    </form>
  );
}
