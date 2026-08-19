"use client";

import Link from "next/link";
import { ExternalLink, FileText, SearchX } from "lucide-react";

import ResumeStatusBadge from "@/components/resumes/ResumeStatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

const HEAD_CLASS =
  "px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted";
const CELL_CLASS = "px-4 py-3 align-middle";

function OpenLink({ candidateId }) {
  return (
    <Link
      href={`/assistant?candidate=${candidateId}`}
      className="text-[13px] font-medium text-accent hover:text-accent-strong hover:underline"
    >
      Open
    </Link>
  );
}

/*
| Seven columns, no more. A table stays useful only while every column earns
| its width.
|
| Rows are rendered as cards below the `md` breakpoint, since a horizontally
| scrolling table is unusable on a phone.
*/
export default function ResumeTable({
  rows,
  isLoading,
  isError,
  isEmpty,
  hasNoMatches,
  onRetry,
  onUpload,
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-line bg-surface">
        <TableSkeleton rows={6} columns={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-line bg-surface">
        <ErrorState
          title="Unable to load resumes."
          description="The resume list could not be retrieved."
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-line bg-surface">
        <EmptyState
          icon={FileText}
          title="No candidates yet."
          description="Upload your first resume to begin."
          action={
            <button
              type="button"
              onClick={onUpload}
              className="inline-flex h-9 items-center rounded-md bg-accent px-3.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Upload resume
            </button>
          }
        />
      </div>
    );
  }

  if (hasNoMatches) {
    return (
      <div className="rounded-lg border border-line bg-surface">
        <EmptyState
          icon={SearchX}
          title="No candidates match your search."
          description="Try a different name, position, template or file name."
        />
      </div>
    );
  }

  return (
    <>
      {/* Table — md and up */}
      <div className="hidden overflow-hidden rounded-lg border border-line bg-surface md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <caption className="sr-only">
              Uploaded resumes with candidate, position, template and processing
              status
            </caption>

            <thead className="border-b border-line bg-canvas">
              <tr>
                <th scope="col" className={HEAD_CLASS}>
                  Candidate
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  Position
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  Resume
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  Template
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  Status
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  Uploaded
                </th>
                <th scope="col" className={`${HEAD_CLASS} text-right`}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line last:border-b-0 transition-colors hover:bg-canvas"
                >
                  <th scope="row" className={`${CELL_CLASS} text-left`}>
                    <span className="text-[13px] font-medium text-ink">
                      {row.candidate.name}
                    </span>
                  </th>

                  <td className={`${CELL_CLASS} text-[13px] text-body`}>
                    {row.candidate.position || "—"}
                  </td>

                  <td className={CELL_CLASS}>
                    {row.secureUrl ? (
                      <a
                        href={row.secureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-[16rem] items-center gap-1.5 text-[13px] text-accent hover:underline"
                      >
                        <span className="truncate">{row.fileName}</span>
                        <ExternalLink
                          className="h-3 w-3 shrink-0"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      <span className="block max-w-[16rem] truncate text-[13px] text-body">
                        {row.fileName}
                      </span>
                    )}
                  </td>

                  <td className={`${CELL_CLASS} text-[13px] text-body`}>
                    {row.template === "UNKNOWN" ? "—" : row.template}
                  </td>

                  <td className={CELL_CLASS}>
                    <ResumeStatusBadge status={row.status} />
                  </td>

                  <td className={`${CELL_CLASS} whitespace-nowrap text-[13px] text-muted`}>
                    {formatDate(row.uploadedAt)}
                  </td>

                  <td className={`${CELL_CLASS} text-right`}>
                    <OpenLink candidateId={row.candidate.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards — below md */}
      <ul className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-lg border border-line bg-surface px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {row.candidate.name}
                </p>
                <p className="truncate text-[13px] text-muted">
                  {row.candidate.position || "Position not stated"}
                </p>
              </div>
              <ResumeStatusBadge status={row.status} />
            </div>

            <p className="mt-2 truncate text-[13px] text-body">{row.fileName}</p>

            <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-line pt-2.5">
              <span className="text-xs text-muted">
                {row.template === "UNKNOWN" ? "" : `${row.template} · `}
                {formatDate(row.uploadedAt)}
              </span>
              <OpenLink candidateId={row.candidate.id} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
