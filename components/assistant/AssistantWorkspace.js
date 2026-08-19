"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserSearch, X } from "lucide-react";

import AssistantSidebar from "@/components/assistant/AssistantSidebar";
import ChatInput from "@/components/assistant/ChatInput";
import ChatWindow from "@/components/assistant/ChatWindow";
import ResumeContextPanel from "@/components/assistant/ResumeContextPanel";
import SelectedCandidateHeader from "@/components/assistant/SelectedCandidateHeader";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Spinner from "@/components/ui/Spinner";
import { useCandidates } from "@/hooks/useCandidates";
import { useConversation } from "@/hooks/useConversation";
import { useConversations } from "@/hooks/useConversations";
import { RESUME_STATUS } from "@/lib/constants";
import { defaultResumeFor, findResume } from "@/lib/utils";

/*
|--------------------------------------------------------------------------
| Assistant workspace
|--------------------------------------------------------------------------
|
| Three panes on desktop: candidates and conversations, the conversation
| itself, and resume context. Below xl the context panel becomes a drawer;
| below lg the candidate pane does too.
|
| The selected candidate lives in the URL (?candidate=…&conversation=…) so a
| review can be bookmarked, reloaded or shared with a colleague and land on
| exactly the same resume.
|
*/
export default function AssistantWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const candidateIdParam = searchParams.get("candidate");
  const conversationIdParam = searchParams.get("conversation");

  const candidatesState = useCandidates();
  const { allCandidates } = candidatesState;

  /*
   * A resume choice is only meaningful for the candidate it was made against,
   * so it is stored with that candidate's id. Switching candidates therefore
   * falls back to the default without any state to reset.
   */
  const [resumeChoice, setResumeChoice] = useState(null);
  const [candidatesDrawerOpen, setCandidatesDrawerOpen] = useState(false);
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);

  const selectedCandidate = useMemo(
    () => allCandidates.find((candidate) => candidate.id === candidateIdParam) || null,
    [allCandidates, candidateIdParam]
  );

  /* Defaults to the resume the backend would pick for this candidate. */
  const selectedResume = useMemo(() => {
    if (!selectedCandidate) return null;

    if (resumeChoice?.candidateId === selectedCandidate.id) {
      const chosen = findResume(selectedCandidate, resumeChoice.resumeId);
      if (chosen) return chosen;
    }

    return defaultResumeFor(selectedCandidate);
  }, [selectedCandidate, resumeChoice]);

  const selectResume = useCallback(
    (resumeId) => {
      if (!selectedCandidate) return;
      setResumeChoice({ candidateId: selectedCandidate.id, resumeId });
    },
    [selectedCandidate]
  );

  const conversationsState = useConversations(selectedCandidate?.id || null);
  const { addConversation, applyLocalUpdate } = conversationsState;

  const updateQuery = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(next).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      router.replace(`/assistant?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const onConversationCreated = useCallback(
    (conversation) => {
      addConversation(conversation);
      updateQuery({ conversation: conversation._id });
    },
    [addConversation, updateQuery]
  );

  const onConversationUpdated = useCallback(
    (conversationId, patch) => applyLocalUpdate(conversationId, patch),
    [applyLocalUpdate]
  );

  const conversation = useConversation({
    conversationId: conversationIdParam,
    candidateId: selectedCandidate?.id || null,
    resumeId: selectedResume?.id || null,
    onConversationCreated,
    onConversationUpdated,
  });

  const selectCandidate = useCallback(
    (candidate) => {
      setCandidatesDrawerOpen(false);
      if (candidate.id === candidateIdParam) return;
      /* A different candidate always starts a fresh conversation. */
      updateQuery({ candidate: candidate.id, conversation: null });
    },
    [candidateIdParam, updateQuery]
  );

  const selectConversation = useCallback(
    (conversationId) => updateQuery({ conversation: conversationId }),
    [updateQuery]
  );

  const startNewConversation = useCallback(
    () => updateQuery({ conversation: null }),
    [updateQuery]
  );

  const resumeReady = selectedResume?.status === RESUME_STATUS.COMPLETED;

  const sidebar = (
    <AssistantSidebar
      candidates={candidatesState.candidates}
      candidatesState={candidatesState}
      selectedCandidateId={selectedCandidate?.id || null}
      onSelectCandidate={selectCandidate}
      conversationsState={conversationsState}
      activeConversationId={conversationIdParam}
      isDraftConversation={!conversationIdParam}
      onSelectConversation={selectConversation}
      onStartNewConversation={startNewConversation}
    />
  );

  return (
    <div className="flex h-full min-h-0">
      {/* Left pane — desktop */}
      <div className="hidden w-72 shrink-0 border-r border-line lg:block">
        {sidebar}
      </div>

      {/* Left pane — drawer below lg */}
      {candidatesDrawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            aria-hidden="true"
            onClick={() => setCandidatesDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select a candidate"
            className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col border-r border-line bg-surface"
          >
            <div className="flex shrink-0 justify-end border-b border-line px-2 py-1.5">
              <button
                type="button"
                onClick={() => setCandidatesDrawerOpen(false)}
                aria-label="Close candidate list"
                className="rounded p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1">{sidebar}</div>
          </div>
        </div>
      ) : null}

      {/* Centre — conversation */}
      <section className="flex min-w-0 flex-1 flex-col bg-canvas">
        {/* A deep link names a candidate the list has not resolved yet. */}
        {!selectedCandidate && candidateIdParam && candidatesState.isLoading ? (
          <div className="flex h-full items-center justify-center gap-2.5 p-6">
            <Spinner className="text-accent" />
            <span className="text-sm text-muted">Loading candidate...</span>
          </div>
        ) : !selectedCandidate && candidateIdParam && !candidatesState.isLoading ? (
          <div className="flex h-full items-center justify-center p-6">
            <ErrorState
              title="That candidate could not be found."
              description="The record may have been archived. Choose another candidate to continue."
              onRetry={() => updateQuery({ candidate: null, conversation: null })}
              retryLabel="Clear selection"
            />
          </div>
        ) : !selectedCandidate ? (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState
              icon={UserSearch}
              title="Select a candidate to start reviewing their resume."
              description={
                candidatesState.isEmpty
                  ? "No candidates have been uploaded yet."
                  : "The assistant only answers questions about a resume you have explicitly selected."
              }
              action={
                <button
                  type="button"
                  onClick={() => setCandidatesDrawerOpen(true)}
                  className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:bg-canvas lg:hidden"
                >
                  Browse candidates
                </button>
              }
            />
          </div>
        ) : (
          <>
            <SelectedCandidateHeader
              candidate={selectedCandidate}
              resumes={selectedCandidate.resumes}
              selectedResume={selectedResume}
              onSelectResume={selectResume}
              onOpenCandidates={() => setCandidatesDrawerOpen(true)}
              onOpenContext={() => setContextDrawerOpen(true)}
            />

            <ChatWindow
              candidate={selectedCandidate}
              selectedResume={selectedResume}
              messages={conversation.messages}
              isLoading={conversation.isLoading}
              isLoadError={conversation.isLoadError}
              onReload={conversation.reload}
              sending={conversation.sending}
              sendError={conversation.sendError}
              onRetry={conversation.retry}
              onAsk={conversation.sendMessage}
            />

            <ChatInput
              candidateName={selectedCandidate.name}
              onSend={conversation.sendMessage}
              sending={conversation.sending}
              disabled={!resumeReady || conversation.isLoading}
            />
          </>
        )}
      </section>

      {/* Right pane — desktop */}
      {selectedCandidate ? (
        <aside className="hidden w-72 shrink-0 border-l border-line bg-surface xl:block">
          <ResumeContextPanel candidate={selectedCandidate} resume={selectedResume} />
        </aside>
      ) : null}

      {/* Right pane — drawer below xl */}
      {contextDrawerOpen && selectedCandidate ? (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            aria-hidden="true"
            onClick={() => setContextDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Resume details"
            className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col border-l border-line bg-surface"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-line px-3 py-2">
              <span className="text-sm font-semibold text-ink">Resume details</span>
              <button
                type="button"
                onClick={() => setContextDrawerOpen(false)}
                aria-label="Close resume details"
                className="rounded p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <ResumeContextPanel
                candidate={selectedCandidate}
                resume={selectedResume}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
