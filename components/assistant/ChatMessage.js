import { AlertTriangle } from "lucide-react";

import AssessmentBadge from "@/components/assistant/AssessmentBadge";
import EvidenceList from "@/components/assistant/EvidenceList";
import FormattedAnswer from "@/components/assistant/FormattedAnswer";
import GapsList from "@/components/assistant/GapsList";
import { formatDateTime } from "@/lib/utils";

function MessageFrame({ author, timestamp, tone, children }) {
  const isAssistant = tone === "assistant";

  return (
    <article
      className={
        isAssistant
          ? "rounded-lg border border-line bg-subtle px-4 py-3.5"
          : "rounded-lg border border-line bg-surface px-4 py-3.5"
      }
    >
      <header className="mb-2 flex items-baseline gap-2">
        <h3
          className={
            isAssistant
              ? "text-xs font-semibold uppercase tracking-wide text-accent"
              : "text-xs font-semibold uppercase tracking-wide text-ink-2"
          }
        >
          {author}
        </h3>
        {timestamp ? (
          <time className="text-xs text-muted">{formatDateTime(timestamp)}</time>
        ) : null}
      </header>

      {children}
    </article>
  );
}

export default function ChatMessage({ message, resumeUrl }) {
  if (message.role === "user") {
    return (
      <MessageFrame author="HR" timestamp={message.createdAt} tone="user">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {message.content}
        </p>

        {message.failed ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-warning">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            Not sent. This question was not saved to the conversation.
          </p>
        ) : null}
      </MessageFrame>
    );
  }

  return (
    <MessageFrame author="Assistant" timestamp={message.createdAt} tone="assistant">
      <div className="flex flex-col gap-3">
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
            Answer
          </h4>
          <FormattedAnswer text={message.content} />
        </section>

        <EvidenceList evidence={message.evidence} resumeUrl={resumeUrl} />

        <GapsList gaps={message.gaps} />

        {message.assessment ? (
          <section className="mt-1 border-t border-line pt-3">
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
              Match assessment
            </h4>
            <AssessmentBadge assessment={message.assessment} showDescription />
          </section>
        ) : null}
      </div>
    </MessageFrame>
  );
}
