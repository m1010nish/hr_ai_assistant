"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";

import EvidenceCard from "@/components/assistant/EvidenceCard";
import { cn } from "@/lib/utils";

/*
| Evidence is the point of the product, so it is expanded by default and can
| be collapsed once HR has read it — not hidden behind a disclosure they have
| to discover.
*/
export default function EvidenceList({ evidence, resumeUrl }) {
  const [open, setOpen] = useState(true);

  const items = (evidence || []).filter(
    (item) => item?.sourceText?.trim() || item?.relevance?.trim()
  );

  if (!items.length) return null;

  return (
    <section className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 border-b border-line pb-1.5 text-left"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-150",
            !open && "-rotate-90"
          )}
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-2">
          Resume evidence
        </span>
        <span className="text-xs text-muted">
          {items.length} {items.length === 1 ? "extract" : "extracts"}
        </span>
      </button>

      {open ? (
        <>
          <ul className="mt-2.5 flex flex-col gap-2">
            {items.map((item, index) => (
              <EvidenceCard key={`${item.section || "evidence"}-${index}`} item={item} />
            ))}
          </ul>

          {/* One link for the whole section — repeating it per extract is noise. */}
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-strong hover:underline"
            >
              View resume
              <ExternalLink className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
            </a>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
