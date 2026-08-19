import { Info } from "lucide-react";

/*
| What the resume does not say. Framed as missing information for HR to follow
| up on, never as a shortcoming of the candidate.
*/
export default function GapsList({ gaps }) {
  const items = (gaps || []).filter((gap) => gap?.trim());

  if (!items.length) return null;

  return (
    <section className="mt-4">
      <div className="flex items-center gap-2 border-b border-line pb-1.5">
        <Info className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={2} aria-hidden="true" />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-2">
          Missing information
        </h4>
      </div>

      <ul className="mt-2.5 flex flex-col gap-1.5">
        {items.map((gap, index) => (
          <li
            key={index}
            className="flex gap-2 text-[13px] leading-relaxed text-body"
          >
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
            {gap}
          </li>
        ))}
      </ul>
    </section>
  );
}
