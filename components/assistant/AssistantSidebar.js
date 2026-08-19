"use client";

import Link from "next/link";

import CandidateList from "@/components/candidates/CandidateList";
import CandidateSearch from "@/components/candidates/CandidateSearch";
import ConversationList from "@/components/assistant/ConversationList";
import Button from "@/components/ui/Button";

/*
| Candidate selection on top, conversations for the selected candidate below.
| The candidate list scrolls independently so the conversation list stays
| reachable without hunting.
*/
export default function AssistantSidebar({
  candidates,
  candidatesState,
  selectedCandidateId,
  onSelectCandidate,
  conversationsState,
  activeConversationId,
  isDraftConversation,
  onSelectConversation,
  onStartNewConversation,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="shrink-0 border-b border-line px-3.5 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-ink">
          AI Assistant
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          Select a candidate to review their resume.
        </p>

        <CandidateSearch
          className="mt-3"
          value={candidatesState.search}
          onChange={candidatesState.setSearch}
        />
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        <CandidateList
          candidates={candidates}
          selectedId={selectedCandidateId}
          onSelect={onSelectCandidate}
          isLoading={candidatesState.isLoading}
          isError={candidatesState.isError}
          isEmpty={candidatesState.isEmpty}
          hasNoMatches={candidatesState.hasNoMatches}
          onRetry={candidatesState.reload}
          emptyAction={
            <Link
              href="/resumes"
              className="inline-flex h-8 items-center rounded-md bg-accent px-3 text-[13px] font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Upload a resume
            </Link>
          }
        />

        {candidatesState.pageCount > 1 ? (
          <div className="flex items-center justify-between gap-2 border-t border-line px-3.5 py-2.5">
            <Button
              variant="ghost"
              size="sm"
              disabled={candidatesState.page <= 1}
              onClick={() => candidatesState.setPage(candidatesState.page - 1)}
            >
              Previous
            </Button>

            <span className="text-xs text-muted">
              {candidatesState.page} / {candidatesState.pageCount}
            </span>

            <Button
              variant="ghost"
              size="sm"
              disabled={candidatesState.page >= candidatesState.pageCount}
              onClick={() => candidatesState.setPage(candidatesState.page + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>

      {selectedCandidateId ? (
        <div className="max-h-[45%] shrink-0 overflow-y-auto border-t border-line">
          <ConversationList
            conversations={conversationsState.conversations}
            activeConversationId={activeConversationId}
            isDraft={isDraftConversation}
            onSelect={onSelectConversation}
            onStartNew={onStartNewConversation}
            isLoading={conversationsState.isLoading}
            isError={conversationsState.isError}
            isEmpty={conversationsState.isEmpty}
            onRetry={conversationsState.reload}
          />
        </div>
      ) : null}
    </div>
  );
}
