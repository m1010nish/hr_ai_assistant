"use client";

import { MessageSquarePlus, Plus } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { cn, formatRelativeDate } from "@/lib/utils";

export default function ConversationList({
  conversations,
  activeConversationId,
  isDraft,
  onSelect,
  onStartNew,
  isLoading,
  isError,
  isEmpty,
  onRetry,
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Conversations
        </h3>

        <button
          type="button"
          onClick={onStartNew}
          className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-soft"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          New
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 px-3.5 py-2" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          compact
          title="Unable to load conversations."
          onRetry={onRetry}
          className="py-4"
        />
      ) : isEmpty && !isDraft ? (
        <EmptyState
          icon={MessageSquarePlus}
          title="No conversations yet."
          description="Ask your first question about this candidate."
          className="px-4 py-6"
        />
      ) : (
        <ul className="flex flex-col gap-0.5 px-2 pb-2">
          {isDraft ? (
            <li>
              <span className="flex items-center gap-2 rounded-md border border-dashed border-accent/40 bg-accent-soft px-2.5 py-2 text-[13px] font-medium text-accent">
                New conversation
              </span>
            </li>
          ) : null}

          {conversations.map((conversation) => {
            const active = !isDraft && conversation.id === activeConversationId;

            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "w-full rounded-md px-2.5 py-2 text-left transition-colors",
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-body hover:bg-canvas hover:text-ink"
                  )}
                >
                  <span className="block truncate text-[13px] font-medium">
                    {conversation.title}
                  </span>
                  <span className="block text-xs text-muted">
                    {formatRelativeDate(conversation.updatedAt)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
