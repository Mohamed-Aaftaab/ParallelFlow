"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavigationTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Monad Workflow Builder",
      href: "/workflow",
      icon: Workflow,
      description: "Transfer tokens, batch payments, & deploy smart contracts",
    }
  ];

  return (
    <div className="border-b-4 border-black bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "group relative px-6 py-4 font-black text-sm flex items-center gap-2 transition-all duration-200",
                  isActive
                    ? "text-purple-600 border-b-4 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="w-5 h-5 text-purple-600" />
                <div className="flex flex-col">
                  <span className="font-extrabold">{tab.name}</span>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-gray-500">
                    {tab.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
