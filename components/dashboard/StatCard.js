import Skeleton from "@/components/ui/Skeleton";

export default function StatCard({ label, value, hint, loading }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>

      {loading ? (
        <Skeleton className="mt-2 h-7 w-16" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-ink">
          {value}
        </p>
      )}

      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
