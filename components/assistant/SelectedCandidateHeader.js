"use client";

import { ExternalLink, PanelRightOpen, Users } from "lucide-react";

import ResumeStatusBadge from "@/components/resumes/ResumeStatusBadge";
import Button from "@/components/ui/Button";
import { RESUME_STATUS } from "@/lib/constants";

/*
| Pinned above the conversation. HR must never have to wonder which resume the
| assistant is reading from, so the candidate, the resume file and its
| processing state stay visible for the whole exchange.
|
| The resume control is a real <select> because a candidate will eventually
| carry several resumes; with one it renders as a static label.
*/
export default function SelectedCandidateHeader({
  candidate,
  resumes,
  selectedResume,
  onSelectResume,
  onOpenCandidates,
  onOpenContext,
}) {
  const hasChoice = resumes.length > 1;

  return (
    <header className="shrink-0 border-b border-line bg-surface px-4 py-3.5 lg:px-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Selected candidate
          </p>

          <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-ink">
            {candidate.name}
          </h2>

          <p className="text-[13px] text-muted">
            {candidate.position || "Position not stated"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenCandidates}
            className="lg:hidden"
          >
            <Users className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            Candidates
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenContext}
            className="xl:hidden"
          >
            <PanelRightOpen className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            Resume details
          </Button>

          {/* A real link: the backend-issued secure URL, opened in a new tab. */}
          {selectedResume?.secureUrl ? (
            <a
              href={selectedResume.secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
            >
              View resume
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xs font-medium text-muted">Resume</span>

          {hasChoice ? (
            <>
              <label htmlFor="assistant-resume-select" className="sr-only">
                Select the resume to analyse
              </label>
              <select
                id="assistant-resume-select"
                value={selectedResume?.id || ""}
                onChange={(event) => onSelectResume(event.target.value)}
                className="h-8 max-w-[18rem] rounded-md border border-line bg-surface px-2 text-[13px] font-medium text-ink transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.fileName}
                    {resume.template && resume.template !== "UNKNOWN"
                      ? ` — ${resume.template}`
                      : ""}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <span className="truncate text-[13px] font-medium text-ink">
              {selectedResume?.fileName || "No resume on file"}
            </span>
          )}
        </div>

        {selectedResume?.template && selectedResume.template !== "UNKNOWN" ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted">Template</span>
            <span className="text-[13px] font-medium text-ink">
              {selectedResume.template}
            </span>
          </div>
        ) : null}

        {selectedResume ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted">Status</span>
            <ResumeStatusBadge status={selectedResume.status} />
          </div>
        ) : null}

        {selectedResume?.status === RESUME_STATUS.COMPLETED ? (
          <p className="ml-auto text-xs text-muted">
            Answers are based on this resume only.
          </p>
        ) : null}
      </div>
    </header>
  );
}
