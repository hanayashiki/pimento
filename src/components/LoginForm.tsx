"use client";

import { cx } from "classix";

import { loginInOrSignUp } from "@/app/_actions";
import { useAction } from "@/lib/action";

export default function LoginForm() {
  const { errors, loading, clearErrors, execute } = useAction(loginInOrSignUp);

  return (
    <form
      className="flex flex-col card bg-gray-800 shadow-xl"
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();

        execute({
          email: (document.getElementById("email") as HTMLInputElement).value,
          inputPassword: (
            document.getElementById("inputPassword") as HTMLInputElement
          ).value,
        });
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
          className={cx("input", errors?.email && "input-error")}
          placeholder="Email"
          type="email"
          name="email"
          id="email"
          onChange={clearErrors}
        />
        <div className="text-error text-xs">{errors?.email?._errors}</div>
        <input
          className={cx("input", errors?.inputPassword && "input-error")}
          placeholder="Password"
          type="password"
          name="inputPassword"
          id="inputPassword"
          onChange={clearErrors}
        />
        <div className="text-error text-xs">
          {errors?.inputPassword?._errors}
        </div>

        <div className="card-actions justify-center mt-4">
          <button className={cx("btn btn-accent", loading && "loading")}>
            Log In or Sign Up
          </button>
        </div>
      </div>
    </form>
  );
}
