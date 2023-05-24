"use client";

import { cx } from "classix";
import Link from "next/link";

import { createAccount } from "@/app/_actions";
import { useAction } from "@/lib/action/client";
import { hashPassword, setPersistHashedPassword } from "@/lib/Sensitive";

export default function CreateAccountForm() {
  const { formErrors, loading, clearErrors, execute } =
    useAction(createAccount);

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
          inputPassword: (
            document.getElementById("inputPassword") as HTMLInputElement
          ).value,
        }))!;

        setPersistHashedPassword(await hashPassword(inputPassword, user.nonce));

        location.href = "/dashboard";
      }}
      action="#"
    >
      <div className="text-primary text-3xl font-bold pt-8 flex justify-center items-center">
        Pimento
      </div>

      <div className="text-center text-primary opacity-60">
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
        />
        <div className="text-error text-xs">{formErrors?.email?._errors}</div>
        <input
          className={cx("input", formErrors?.inputPassword && "input-error")}
          placeholder="Password"
          type="password"
          name="inputPassword"
          id="inputPassword"
          onChange={clearErrors}
        />
        <div className="text-error text-xs">
          {formErrors?.inputPassword?._errors}
        </div>

        <div className="text-primary font-bold text-sm">
          Already registered?{" "}
          <Link className="underline" href="login">
            Log In
          </Link>
        </div>

        <div className="card-actions justify-center mt-4">
          <button className={cx("btn btn-accent", loading && "loading")}>
            Create Account
          </button>
        </div>
      </div>
    </form>
  );
}
