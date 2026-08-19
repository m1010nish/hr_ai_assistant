/*
| Consistent page heading: a 24px title, one line of context, and room for the
| page's primary action on the right.
*/
export default function PageHeader({ title, description, actions = null }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line bg-surface px-4 py-5 sm:flex-row sm:items-start sm:justify-between lg:px-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
