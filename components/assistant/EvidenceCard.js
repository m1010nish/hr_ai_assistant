/*
| One quoted passage from the resume plus why it is relevant. Pale green,
| subtle border — distinct from the answer body without reading as a warning.
*/
export default function EvidenceCard({ item }) {
  const section = item?.section?.trim();
  const sourceText = item?.sourceText?.trim();
  const relevance = item?.relevance?.trim();

  if (!sourceText && !relevance) return null;

  return (
    <li className="rounded-md border border-success/20 bg-evidence px-3.5 py-3">
      {section ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-success">
          {section}
        </p>
      ) : null}

      {sourceText ? (
        <blockquote className="mt-1.5 border-l-2 border-success/40 pl-3 text-[13px] leading-relaxed text-ink-2">
          &ldquo;{sourceText}&rdquo;
        </blockquote>
      ) : null}

      {relevance ? (
        <p className="mt-2 text-[13px] leading-relaxed text-body">{relevance}</p>
      ) : null}
    </li>
  );
}
