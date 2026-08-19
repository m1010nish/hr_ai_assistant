"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const WIDTHS = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

/*
| A plain dialog: escape to close, focus moved in on open and returned on
| close, background scroll locked. No entrance animation beyond a short fade —
| this is a work tool, not a showcase.
*/
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer = null,
  closeOnBackdrop = true,
}) {
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocusedRef.current = document.activeElement;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    /* Move focus into the dialog once it is mounted. */
    const focusTimer = window.setTimeout(() => {
      /*
       * Skip visually hidden controls (the file input) so keyboard users land
       * somewhere they can actually see the focus ring.
       */
      const target = panelRef.current?.querySelector(
        "input:not(.sr-only), textarea, select, button:not([data-dialog-dismiss])"
      );
      (target || panelRef.current)?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = overflow;
      window.clearTimeout(focusTimer);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-ink/40"
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative my-auto w-full rounded-lg border border-line bg-surface shadow-lg outline-none",
          WIDTHS[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-0.5 text-[13px] text-muted">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            data-dialog-dismiss
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 -mt-1 rounded p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-line bg-canvas px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
