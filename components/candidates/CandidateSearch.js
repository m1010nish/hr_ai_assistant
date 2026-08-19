"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

/*
| Debounced so that a server-side search endpoint can be dropped in without
| firing a request per keystroke. The visible input stays fully responsive.
*/
export default function CandidateSearch({
  value,
  onChange,
  placeholder = "Search candidates...",
  label = "Search candidates",
  className,
  delay = 200,
}) {
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  /*
   * Adjust during render when the value is reset from outside — React's
   * documented alternative to synchronising props into state in an effect.
   */
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return undefined;

    const timer = window.setTimeout(() => onChange(draft), delay);
    return () => window.clearTimeout(timer);
  }, [draft, value, onChange, delay]);

  return (
    <div className={cn("relative", className)}>
      <label htmlFor="candidate-search" className="sr-only">
        {label}
      </label>

      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        strokeWidth={1.75}
        aria-hidden="true"
      />

      <input
        id="candidate-search"
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-line bg-surface pl-8 pr-3 text-sm text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
