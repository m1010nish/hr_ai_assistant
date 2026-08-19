"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessagesSquare, Plus, Users } from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import PageHeader from "@/components/layout/PageHeader";
import ResumeStatusBadge from "@/components/resumes/ResumeStatusBadge";
import ResumeUpload from "@/components/resumes/ResumeUpload";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { useCandidates } from "@/hooks/useCandidates";
import { useIsClient } from "@/hooks/useIsClient";
import { useRecentConversations } from "@/hooks/useConversations";
import { RESUME_STATUS } from "@/lib/constants";
import { formatDate, formatRelativeDate, defaultResumeFor } from "@/lib/utils";

/*
| Depends on the visitor's local clock, so it can only run on the client.
| This page is statically prerendered — the build happens once, long before
| anyone opens it — and baking a greeting into that HTML guarantees a
| hydration mismatch for most visitors. It is rendered as a subtitle behind
| useIsClient() rather than as the page title, so nothing shifts on load.
*/
function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Panel({ title, action, children }) {
  return (
    <section className="flex min-w-0 flex-col rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function DashboardView() {
  const candidatesState = useCandidates();
  const { allCandidates } = candidatesState;
  const [uploadOpen, setUploadOpen] = useState(false);
  const isClient = useIsClient();

  const recent = useRecentConversations(allCandidates);

  const stats = useMemo(() => {
    const resumes = allCandidates.flatMap((candidate) => candidate.resumes);

    return {
      candidates: allCandidates.length,
      active: resumes.filter((resume) => resume.status === RESUME_STATUS.COMPLETED)
        .length,
      processing: resumes.filter(
        (resume) =>
          resume.status === RESUME_STATUS.PROCESSING ||
          resume.status === RESUME_STATUS.PENDING
      ).length,
    };
  }, [allCandidates]);

  const recentCandidates = allCandidates.slice(0, 6);

  const candidateNameById = useMemo(() => {
    const map = new Map();
    allCandidates.forEach((candidate) => map.set(candidate.id, candidate.name));
    return map;
  }, [allCandidates]);

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <PageHeader
        title="Dashboard"
        description={
          isClient
            ? `${greeting()}. Review candidates and resume insights.`
            : "Review candidates and resume insights."
        }
        actions={
          <>
            <Button variant="primary" onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Upload Resume
            </Button>

            <Link
              href="/assistant"
              className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:bg-canvas"
            >
              Open AI Assistant
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-5 px-4 py-5 lg:px-6">
        {candidatesState.isError ? (
          <div className="rounded-lg border border-line bg-surface">
            <ErrorState
              title="Unable to load dashboard data."
              description="The candidate records could not be retrieved."
              onRetry={candidatesState.reload}
            />
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Candidates"
                value={stats.candidates}
                loading={candidatesState.isLoading}
              />
              <StatCard
                label="Active resumes"
                value={stats.active}
                hint="Extracted and ready to query"
                loading={candidatesState.isLoading}
              />
              <StatCard
                label="Processing"
                value={stats.processing}
                hint="Awaiting extraction"
                loading={candidatesState.isLoading}
              />
              <StatCard
                label="Conversations"
                value={recent.conversations.length}
                hint={`Across the ${recent.sampledCandidates} most recent candidates`}
                loading={candidatesState.isLoading || recent.isLoading}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <Panel
                title="Recent candidates"
                action={
                  <Link
                    href="/resumes"
                    className="text-[13px] font-medium text-accent hover:underline"
                  >
                    View all
                  </Link>
                }
              >
                {candidatesState.isLoading ? (
                  <div className="flex flex-col">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="border-b border-line px-4 py-3">
                        <Skeleton className="h-3.5 w-1/3" />
                        <Skeleton className="mt-2 h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : recentCandidates.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No candidates yet."
                    description="Upload your first resume to begin."
                    action={
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setUploadOpen(true)}
                      >
                        Upload Resume
                      </Button>
                    }
                  />
                ) : (
                  <ul className="flex flex-col">
                    {recentCandidates.map((candidate) => {
                      const resume = defaultResumeFor(candidate);

                      return (
                        <li
                          key={candidate.id}
                          className="border-b border-line last:border-b-0"
                        >
                          <Link
                            href={`/assistant?candidate=${candidate.id}`}
                            className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-canvas"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-medium text-ink">
                                {candidate.name}
                              </span>
                              <span className="block truncate text-xs text-muted">
                                {candidate.position || "Position not stated"}
                              </span>
                            </span>

                            <span className="hidden min-w-0 flex-1 truncate text-[13px] text-body sm:block">
                              {resume?.fileName || "No resume"}
                            </span>

                            {resume ? (
                              <ResumeStatusBadge status={resume.status} />
                            ) : null}

                            <span className="hidden whitespace-nowrap text-xs text-muted lg:block">
                              {formatDate(resume?.uploadedAt || candidate.createdAt)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Panel>

              <Panel title="Recent conversations">
                {recent.isLoading ? (
                  <div className="flex flex-col">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="border-b border-line px-4 py-3">
                        <Skeleton className="h-3.5 w-2/3" />
                        <Skeleton className="mt-2 h-3 w-1/3" />
                      </div>
                    ))}
                  </div>
                ) : recent.conversations.length === 0 ? (
                  <EmptyState
                    icon={MessagesSquare}
                    title="No conversations yet."
                    description="Select a candidate in the assistant to ask your first question."
                    className="py-10"
                  />
                ) : (
                  <ul className="flex flex-col">
                    {recent.conversations.map((conversation) => (
                      <li
                        key={conversation.id}
                        className="border-b border-line last:border-b-0"
                      >
                        <Link
                          href={`/assistant?candidate=${conversation.candidateId}&conversation=${conversation.id}`}
                          className="block px-4 py-3 transition-colors hover:bg-canvas"
                        >
                          <span className="block truncate text-[13px] font-medium text-ink">
                            {conversation.title}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {candidateNameById.get(conversation.candidateId) ||
                              "Candidate"}{" "}
                            · {formatRelativeDate(conversation.updatedAt)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </>
        )}
      </div>

      <ResumeUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => candidatesState.reload()}
      />
    </div>
  );
}
