"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import { APP_NAME } from "@/lib/constants";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  /* Close the drawer whenever the route changes. */
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="rounded-md border border-line p-1.5 text-body transition-colors hover:bg-canvas lg:hidden"
      >
        <Menu className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-surface"
          >
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <span className="text-sm font-semibold text-ink">{APP_NAME}</span>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="rounded p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
