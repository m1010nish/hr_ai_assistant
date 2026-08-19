"use client";

import { ExternalLink } from "lucide-react";

import ResumeStatusBadge from "@/components/resumes/ResumeStatusBadge";
import { formatDate } from "@/lib/utils";

function Section({ title, children }) {
  return (
    <section className="border-b border-line px-4 py-3.5 last:border-b-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function DefinitionRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <dt className="shrink-0 text-xs text-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right text-[13px] text-ink">{value}</dd>
    </div>
  );
}

function TagList({ values }) {
  if (!values?.length) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {values.map((value, index) => (
        <li
          key={`${value}-${index}`}
          className="rounded border border-line bg-canvas px-1.5 py-0.5 text-xs text-body"
        >
          {value}
        </li>
      ))}
    </ul>
  );
}

/*
| Read-only context for the resume the assistant is working from. Everything
| here comes from the candidate record already loaded for the list, so opening
| the panel costs no extra request.
*/
export default function ResumeContextPanel({ candidate, resume }) {
  const location = [candidate.city, candidate.country].filter(Boolean).join(", ");

  const competencyGroups = Object.entries(candidate.competencies || {})
    .filter(([, values]) => Array.isArray(values) && values.length > 0)
    .slice(0, 6);

  const experience = candidate.professionalExperience?.slice(0, 4) || [];
  const qualifications = candidate.qualifications?.slice(0, 6) || [];

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <Section title="Resume">
        {resume ? (
          <div className="flex flex-col gap-2">
            <p className="break-words text-[13px] font-medium text-ink">
              {resume.fileName}
            </p>

            <ResumeStatusBadge status={resume.status} />

            <dl className="mt-1">
              <DefinitionRow label="Template" value={resume.template} />
              <DefinitionRow label="Uploaded" value={formatDate(resume.uploadedAt)} />
              <DefinitionRow label="Processed" value={formatDate(resume.processedAt)} />
            </dl>

            {resume.secureUrl ? (
              <a
                href={resume.secureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-accent-strong hover:underline"
              >
                Open original document
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              </a>
            ) : null}

            {resume.processingError ? (
              <p className="mt-1 rounded border border-danger/20 bg-danger-soft px-2 py-1.5 text-xs text-danger">
                {resume.processingError}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-[13px] text-muted">No resume on file.</p>
        )}
      </Section>

      <Section title="Candidate">
        <dl>
          <DefinitionRow label="Position" value={candidate.position} />
          <DefinitionRow label="Location" value={location} />
          <DefinitionRow label="Email" value={candidate.email} />
          <DefinitionRow label="Phone" value={candidate.phone} />
        </dl>

        {candidate.languages?.length ? (
          <div className="mt-2.5">
            <p className="mb-1.5 text-xs text-muted">Languages</p>
            <TagList values={candidate.languages} />
          </div>
        ) : null}
      </Section>

      {qualifications.length ? (
        <Section title="Qualifications">
          <ul className="flex flex-col gap-2">
            {qualifications.map((item, index) => (
              <li key={index}>
                <p className="text-[13px] font-medium text-ink">
                  {item.name || "Unnamed qualification"}
                </p>
                {item.issuer ? (
                  <p className="text-xs text-muted">{item.issuer}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {experience.length ? (
        <Section title="Experience">
          <ul className="flex flex-col gap-2.5">
            {experience.map((item, index) => (
              <li key={index}>
                <p className="text-[13px] font-medium text-ink">
                  {item.position || item.role || "Role not stated"}
                </p>
                <p className="text-xs text-muted">
                  {[item.employer, [item.dateFrom, item.dateTo].filter(Boolean).join(" – ")]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {competencyGroups.length ? (
        <Section title="Competencies">
          <div className="flex flex-col gap-2.5">
            {competencyGroups.map(([group, values]) => (
              <div key={group}>
                <p className="mb-1.5 text-xs capitalize text-muted">
                  {group.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <TagList values={values.slice(0, 8)} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
