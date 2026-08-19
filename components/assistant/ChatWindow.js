"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, FileSearch } from "lucide-react";

import ChatMessage from "@/components/assistant/ChatMessage";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import { RESUME_STATUS } from "@/lib/constants";

/* Openers that reflect how HR actually reads an inspection resume. */
const STARTER_QUESTIONS = [
  "Summarise this candidate's inspection experience.",
  "Which certifications are listed, and when do they expire?",
  "Does the resume show pressure equipment experience?",
  "Which employers and projects are documented?",
];

function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 lg:p-6" aria-hidden="true">
      {[0, 1].map((index) => (
        <div key={index} className="rounded-lg border border-line bg-surface p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2.5 h-3.5 w-4/5" />
          <Skeleton className="mt-2 h-3.5 w-3/5" />
        </div>
      ))}
    </div>
  );
}

export default function ChatWindow({
  candidate,
  selectedResume,
  messages,
  isLoading,
  isLoadError,
  onReload,
  sending,
  sendError,
  onRetry,
  onAsk,
}) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  /* Follow the conversation as it grows. */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, sending]);

  const resumeReady = selectedResume?.status === RESUME_STATUS.COMPLETED;

  if (isLoading) return <ConversationSkeleton />;

  if (isLoadError) {
    return (
      <ErrorState
        title="Unable to load this conversation."
        description="The messages could not be retrieved."
        onRetry={onReload}
      />
    );
  }

  return (
    <div
      ref={scrollRef}
      className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6"
    >
      {!resumeReady ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-md border border-warning/25 bg-warning-soft px-3.5 py-3">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-warning"
            strokeWidth={2}
            aria-hidden="true"
          />
          <div>
            <p className="text-[13px] font-medium text-ink">
              This resume has not finished processing.
            </p>
            <p className="mt-0.5 text-[13px] text-body">
              {selectedResume
                ? "The assistant can only answer once the resume has been extracted."
                : "Upload a resume for this candidate to start asking questions."}
            </p>
          </div>
        </div>
      ) : null}

      {messages.length === 0 && !sending ? (
        <div className="mx-auto max-w-2xl py-8">
          <div className="flex flex-col items-center text-center">
            <span
              aria-hidden="true"
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-canvas text-muted"
            >
              <FileSearch className="h-5 w-5" strokeWidth={1.75} />
            </span>

            <p className="text-sm font-semibold text-ink">
              Ask your first question about {candidate.name}.
            </p>
            <p className="mt-1 max-w-md text-[13px] text-muted">
              Every answer is drawn from the selected resume and shown with the
              supporting extracts. You remain the decision maker.
            </p>
          </div>

          {resumeReady ? (
            <ul className="mt-5 flex flex-col gap-2">
              {STARTER_QUESTIONS.map((question) => (
                <li key={question}>
                  <button
                    type="button"
                    onClick={() => onAsk(question)}
                    className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-left text-[13px] text-body transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent"
                  >
                    {question}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              resumeUrl={selectedResume?.secureUrl}
            />
          ))}

          {sending ? (
            <div
              className="flex items-center gap-2.5 rounded-lg border border-line bg-subtle px-4 py-3.5"
              role="status"
              aria-live="polite"
            >
              <Spinner size="sm" className="text-accent" />
              <span className="text-[13px] font-medium text-body">
                Analyzing resume...
              </span>
            </div>
          ) : null}

          {sendError && !sending ? (
            <div className="rounded-lg border border-danger/25 bg-danger-soft px-4 py-3.5">
              <p className="text-[13px] font-medium text-ink">
                Unable to generate a response.
              </p>
              <p className="mt-0.5 text-[13px] text-body">{sendError.message}</p>
              <Button variant="secondary" size="sm" className="mt-2.5" onClick={onRetry}>
                Try again
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
