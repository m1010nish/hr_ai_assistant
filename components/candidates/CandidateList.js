"use client";

import { Users, SearchX } from "lucide-react";

import CandidateListItem from "@/components/candidates/CandidateListItem";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { CandidateSkeletonList } from "@/components/ui/Skeleton";

export default function CandidateList({
  candidates,
  selectedId,
  onSelect,
  isLoading,
  isError,
  isEmpty,
  hasNoMatches,
  onRetry,
  emptyAction = null,
}) {
  if (isLoading) return <CandidateSkeletonList rows={7} />;

  if (isError) {
    return (
      <ErrorState
        compact
        title="Unable to load candidates."
        description="The candidate list could not be retrieved."
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={Users}
        title="No candidates yet."
        description="Upload your first resume to begin."
        action={emptyAction}
        className="py-10"
      />
    );
  }

  if (hasNoMatches) {
    return (
      <EmptyState
        icon={SearchX}
        title="No candidates match your search."
        description="Try a different name, position or file name."
        className="py-10"
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {candidates.map((candidate) => (
        <CandidateListItem
          key={candidate.id}
          candidate={candidate}
          selected={candidate.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
