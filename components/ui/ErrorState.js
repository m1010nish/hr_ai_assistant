import { AlertTriangle } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/*
| Errors are shown as plain operational language. Backend messages are passed
| through only when the API supplied one; stack traces never reach this UI.
*/
export default function ErrorState({
  title = "Something went wrong.",
  description,
  onRetry,
  retryLabel = "Retry",
  compact = false,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-6" : "px-6 py-14",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-danger/20 bg-danger-soft text-danger"
      >
        <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
      </span>

      <p className="text-sm font-semibold text-ink">{title}</p>

      {description ? (
        <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>
      ) : null}

      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
