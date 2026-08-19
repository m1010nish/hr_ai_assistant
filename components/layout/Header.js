import Link from "next/link";

import MobileNav from "@/components/layout/MobileNav";
import { APP_NAME } from "@/lib/constants";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 lg:px-6">
      <MobileNav />

      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-sm"
        aria-label={`${APP_NAME} home`}
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded bg-ink text-[11px] font-bold tracking-tight text-white"
        >
          HR
        </span>
        <span className="text-sm font-semibold tracking-tight text-ink">
          {APP_NAME}
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-xs text-muted sm:inline">
          Resume review workspace
        </span>

        <div className="flex items-center gap-2 border-l border-line pl-3">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-canvas text-[11px] font-semibold text-body"
          >
            HR
          </span>
          <span className="hidden text-[13px] font-medium text-ink-2 sm:inline">
            HR Team
          </span>
        </div>
      </div>
    </header>
  );
}
