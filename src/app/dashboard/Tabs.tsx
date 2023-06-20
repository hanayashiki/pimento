"use client";

import { cx } from "classix";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import AccountPasswordTable from "./AccountPasswordTable";
import PaymentCardTable from "./PaymentCardTable";
import TextPasswordTable from "./TextPasswordTable";
import { passwordDefinitions } from "@/lib/models";

const Tabs = () => {
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("type") ?? passwordDefinitions[0].name;

  return (
    <div className="flex flex-col flex-1 flex-shrink overflow-hidden min-w-0">
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

      <div className="px-4 py-6 flex-1 flex flex-col shrink overflow-hidden min-h-0">
        <TextPasswordTable active={activeTab === "TextPassword"} />
        <AccountPasswordTable active={activeTab === "AccountPassword"} />
        <PaymentCardTable active={activeTab === "PaymentCard"} />
      </div>
    </div>
  );
};

export default Tabs;
