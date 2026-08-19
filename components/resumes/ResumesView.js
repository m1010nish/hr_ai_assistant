"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import ResumeTable from "@/components/resumes/ResumeTable";
import ResumeUpload from "@/components/resumes/ResumeUpload";
import CandidateSearch from "@/components/candidates/CandidateSearch";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { useCandidates } from "@/hooks/useCandidates";
import {
  CANDIDATES_PAGE_SIZE,
  RESUME_STATUS,
  RESUME_STATUS_META,
  RESUME_TEMPLATES,
} from "@/lib/constants";
import { matchesCandidateSearch, resumeRowsFrom } from "@/lib/utils";

/*
| Resume management.
|
| The API has no resume-listing route yet, so the rows are built from the
| candidate records — each candidate carries its resume documents, which is
| everything the table needs. `resumeRowsFrom()` is the single seam: when
| GET /api/resumes exists, only that call changes.
*/
export default function ResumesView() {
  const candidatesState = useCandidates();
  const { allCandidates, search, setSearch } = candidatesState;

  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);

  const rows = useMemo(() => {
    const filteredCandidates = allCandidates.filter((candidate) =>
      matchesCandidateSearch(candidate, search)
    );

    return resumeRowsFrom(filteredCandidates)
      .filter((row) => statusFilter === "all" || row.status === statusFilter)
      .filter((row) => templateFilter === "all" || row.template === templateFilter)
      .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
  }, [allCandidates, search, statusFilter, templateFilter]);

  const pageCount = Math.max(1, Math.ceil(rows.length / CANDIDATES_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * CANDIDATES_PAGE_SIZE;
    return rows.slice(start, start + CANDIDATES_PAGE_SIZE);
  }, [rows, currentPage]);

  const filtersActive =
    Boolean(search.trim()) || statusFilter !== "all" || templateFilter !== "all";

  /* Stable identity: CandidateSearch debounces against this callback. */
  const onSearchChange = useCallback(
    (value) => {
      setSearch(value);
      setPage(1);
    },
    [setSearch]
  );

  const onStatusChange = useCallback((value) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const onTemplateChange = useCallback((value) => {
    setTemplateFilter(value);
    setPage(1);
  }, []);

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <PageHeader
        title="Resumes"
        description="Manage candidate resumes and review processing status."
        actions={
          <>
            <Link
              href="/assistant"
              className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:bg-canvas"
            >
              Open AI Assistant
            </Link>

            <Button variant="primary" onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Upload Resume
            </Button>
          </>
        }
      />

      <div className="px-4 py-5 lg:px-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <CandidateSearch
            className="sm:max-w-xs sm:flex-1"
            value={search}
            onChange={onSearchChange}
            placeholder="Search candidates or files..."
            label="Search resumes"
          />

          <div className="grid grid-cols-2 gap-3 sm:w-auto sm:grid-cols-2">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) => onStatusChange(event.target.value)}
              className="sm:w-40"
            >
              <option value="all">All statuses</option>
              {Object.values(RESUME_STATUS).map((status) => (
                <option key={status} value={status}>
                  {RESUME_STATUS_META[status].label}
                </option>
              ))}
            </Select>

            <Select
              label="Template"
              value={templateFilter}
              onChange={(event) => onTemplateChange(event.target.value)}
              className="sm:w-40"
            >
              <option value="all">All templates</option>
              {RESUME_TEMPLATES.map((template) => (
                <option key={template} value={template}>
                  {template === "UNKNOWN" ? "Not specified" : template}
                </option>
              ))}
            </Select>
          </div>

          {!candidatesState.isLoading && !candidatesState.isError ? (
            <p className="text-[13px] text-muted sm:ml-auto sm:pb-2">
              {rows.length} {rows.length === 1 ? "resume" : "resumes"}
            </p>
          ) : null}
        </div>

        <ResumeTable
          rows={visibleRows}
          isLoading={candidatesState.isLoading}
          isError={candidatesState.isError}
          isEmpty={
            !candidatesState.isLoading &&
            !candidatesState.isError &&
            !filtersActive &&
            rows.length === 0
          }
          hasNoMatches={
            !candidatesState.isLoading &&
            !candidatesState.isError &&
            filtersActive &&
            rows.length === 0
          }
          onRetry={candidatesState.reload}
          onUpload={() => setUploadOpen(true)}
        />

        {pageCount > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[13px] text-muted">
              Page {currentPage} of {pageCount}
            </p>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= pageCount}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <ResumeUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => candidatesState.reload()}
      />
    </div>
  );
}
