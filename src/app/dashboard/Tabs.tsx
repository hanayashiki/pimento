"use client";

import { cx } from "classix";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import AccountPasswordTable from "./AccountPasswordTable";
import TextPasswordTable from "./TextPasswordTable";
import { passwordDefinitions } from "@/lib/models";

const Tabs = () => {
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("type") ?? passwordDefinitions[0].name;

  return (
    <div className="flex flex-col flex-1 flex-shrink-0 min-w-0">
      <div className="text-sm breadcrumbs p-4">
        <ul>
          <li>
            <a href="/">Top</a>
          </li>
          <li className="text-accent font-bold">My Secrets</li>
        </ul>
      </div>

      <div className="tabs">
        {passwordDefinitions.map((passwordDefinition) => (
          <Link
            key={passwordDefinition.name}
            href={`/dashboard?type=${passwordDefinition.name}`}
            className={cx(
              "tab tab-bordered",
              activeTab === passwordDefinition.name && "tab-active",
            )}
          >
            {passwordDefinition.label.toLocaleUpperCase()}S
          </Link>
        ))}
      </div>

      <div className="px-4 py-6 flex-1">
        {activeTab === "TextPassword" && <TextPasswordTable />}

        {activeTab === "AccountPassword" && <AccountPasswordTable />}
      </div>
    </div>
  );
};

export default Tabs;
