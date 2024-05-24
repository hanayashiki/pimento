"use client";

import { useContext } from "react";

import gravatar from "gravatar";
import { redirect } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

import { logout } from "../_actions";
import { RelatedLinks } from "@/components/RelatedLinks";
import { useAction } from "@/lib/action/client";
import { useDialog } from "@/lib/client/DialogProvider";
import { MeContext } from "@/lib/client/MeProvider";

export function ClientLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const { me } = useContext(MeContext);

  const { confirmMessage } = useDialog();

  const logoutAction = useAction(logout);

  return (
    <section className="h-full flex flex-col">
      <nav className="py-2 px-4 border-b border-gray-400 flex items-center">
        <span className="text-primary text-2xl font-bold mr-[1rem]">
          Pimento
        </span>

        <RelatedLinks />

        <span className="flex-1" />

        {me && (
          <span className="flex items-center gap-x-2 text-sm text-white">
            <img
              src={gravatar.url(me.email)}
              className="w-6 h-6 rounded-full"
            />
            {me.email.split("@")[0]}
            <button
              className="hover:text-error"
              onClick={async () => {
                if (
                  await confirmMessage({
                    title: "Confirmation",
                    message: "Do you really want to log out?",
                  })
                ) {
                  await logoutAction.execute(undefined);
                  redirect("/logout");
                }
              }}
            >
              <FiLogOut />
            </button>
          </span>
        )}

        {!me && <span>Not Logged In</span>}
      </nav>

      <div className="flex flex-1 shrink overflow-hidden">
        <div className="flex flex-col flex-1 shrink overflow-hidden">
          {children}
        </div>
      </div>
    </section>
  );
}
