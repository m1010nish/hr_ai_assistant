import { cn, initialsOf } from "@/lib/utils";

/*
| A candidate row in the assistant sidebar. Selection is shown with a left
| accent rule and a pale tint rather than a solid blue block, so a long list
| stays calm.
*/
export default function CandidateListItem({ candidate, selected, onSelect }) {
  const resumeCount = candidate.resumes.length;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(candidate)}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "flex w-full items-center gap-3 border-l-2 px-3.5 py-2.5 text-left transition-colors",
          selected
            ? "border-l-accent bg-accent-soft"
            : "border-l-transparent hover:bg-canvas"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
            selected
              ? "border-accent/30 bg-surface text-accent"
              : "border-line bg-canvas text-muted"
          )}
        >
          {initialsOf(candidate.name)}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-[13px] font-medium",
              selected ? "text-accent" : "text-ink"
            )}
          >
            {candidate.name}
          </span>
          <span className="block truncate text-xs text-muted">
            {candidate.position || "Position not stated"}
          </span>
        </span>

        {resumeCount > 1 ? (
          <span className="shrink-0 rounded border border-line bg-surface px-1.5 py-0.5 text-[11px] font-medium text-muted">
            {resumeCount}
            <span className="sr-only"> resumes</span>
          </span>
        ) : null}
      </button>
    </li>
  );
}
