"use client";

import { cx } from "classix";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { passwordDefinitions } from "@/lib/models";

const Tabs = () => {
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("type") ?? passwordDefinitions[0].name;

  return (
    <div>
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
    </div>
  );
};

export default function () {
  return (
    <div>
      <Tabs />
    </div>
  );
}
