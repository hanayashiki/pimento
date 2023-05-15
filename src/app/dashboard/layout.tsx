"use client";

import { useContext, useEffect } from "react";

import gravatar from "gravatar";
import { useRouter } from "next/navigation";

import { MeContext } from "@/lib/client/MeProvider";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const { me } = useContext(MeContext);

  const router = useRouter();

  useEffect(() => {
    if (!me) {
      router.replace("/login");
    }
  }, [me]);

  return (
    <section className="h-full flex flex-col">
      <nav className="p-2 border-b border-gray-400 flex items-center">
        <span className="text-primary text-2xl font-bold">Pimento</span>
        <span className="flex-1" />

        {me && (
          <span className="flex items-center gap-x-2 text-sm text-white">
            <img
              src={gravatar.url(me.email)}
              className="w-6 h-6 rounded-full"
            />
            {me.email.split("@")[0]}
          </span>
        )}

        {!me && <span>Not Logged In</span>}
      </nav>

      {me && children}
      {!me && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Taking you back to Login...
        </div>
      )}
    </section>
  );
}
