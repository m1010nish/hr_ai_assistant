import { cn } from "@/lib/utils";

export default function Skeleton({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block animate-pulse rounded bg-line/70", className)}
    />
  );
}

/* A list of candidate-shaped placeholders, used by the sidebar and lists. */
export function CandidateSkeletonList({ rows = 6 }) {
  return (
    <div className="flex flex-col" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="border-b border-line px-4 py-3">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="mt-2 h-3 w-3/5" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 6 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid items-center gap-4 border-b border-line px-4 py-3.5"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn("h-3.5", colIndex === 0 ? "w-4/5" : "w-3/5")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
