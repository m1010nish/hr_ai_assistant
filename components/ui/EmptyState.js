import { cn } from "@/lib/utils";

export default function EmptyState({
  icon: Icon = null,
  title,
  description,
  action = null,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className
      )}
    >
      {Icon ? (
        <span
          aria-hidden="true"
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-canvas text-muted"
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      ) : null}

      <p className="text-sm font-semibold text-ink">{title}</p>

      {description ? (
        <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>
      ) : null}

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
