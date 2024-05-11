"use client";

import { cx } from "classix";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import AccountPasswordTable from "./AccountPasswordTable";
import PaymentCardTable from "./PaymentCardTable";
import TextPasswordTable from "./TextPasswordTable";
import { RelatedLinks } from "@/components/RelatedLinks";
import { passwordDefinitions } from "@/lib/models";

const Tabs = () => {
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("type") ?? passwordDefinitions[0].name;

  return (
    <div className="flex flex-col flex-1 flex-shrink overflow-hidden min-w-0">
      <div className="text-sm breadcrumbs p-4 [html:has(input:focus)_&]:hidden [html:has([role=autocomplete]:not(.hidden))_&]:hidden sm:!block">
        <ul>
          <li>
            <a href="/">Top</a>
          </li>
          <li className="text-accent font-bold">My Secrets</li>
        </ul>
      </div>

      <div className="tabs [html:has(input:focus)_&]:hidden [html:has([role=autocomplete]:not(.hidden))_&]:hidden sm:!block">
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

      <div className="px-4 py-4 sm:py-6 flex-1 flex flex-col shrink overflow-hidden min-h-0">
        <TextPasswordTable active={activeTab === "TextPassword"} />
        <AccountPasswordTable active={activeTab === "AccountPassword"} />
        <PaymentCardTable active={activeTab === "PaymentCard"} />

        <div className="flex-1" />
        <div className="pt-3 sm:py-6 px-2 flex justify-center sm:justify-start">
          <RelatedLinks />
        </div>
      </div>
    </div>
  );
};

export default Tabs;
