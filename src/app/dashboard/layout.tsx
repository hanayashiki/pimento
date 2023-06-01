"use client";

import { useContext } from "react";

import gravatar from "gravatar";
import { redirect } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

import { logout } from "../_actions";
import { useAction } from "@/lib/action/client";
import { useDialog } from "@/lib/client/DialogProvider";
import { MeContext } from "@/lib/client/MeProvider";

const DesktopSidebar = () => {
  return (
    <div className="p-3 mr-2 hidden sm:block">
      <ul className="menu bg-base-100 rounded-box">
        <li>
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </a>
        </li>
        <li>
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </a>
        </li>
        <li>
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default function DashboardLayout({
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
        <span className="text-primary text-2xl font-bold">Pimento</span>
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
        <DesktopSidebar />

        <div className="flex flex-col flex-1 shrink overflow-hidden">
          {children}
        </div>
      </div>
    </section>
  );
}
