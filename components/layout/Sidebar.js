"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS, isActivePath } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar({ onNavigate, className }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={cn("flex flex-col gap-0.5 p-3", className)}>
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent-soft font-semibold text-accent"
                : "font-medium text-body hover:bg-canvas hover:text-ink"
            )}
          >
            <Icon
              className={cn("h-4 w-4 shrink-0", active ? "text-accent" : "text-muted")}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
