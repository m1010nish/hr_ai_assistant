import { Suspense } from "react";

import AssistantWorkspace from "@/components/assistant/AssistantWorkspace";
import Spinner from "@/components/ui/Spinner";

export const metadata = {
  title: "AI Assistant",
  description:
    "Ask grounded questions about a selected candidate resume and review the supporting evidence.",
};

/*
| The workspace reads the selected candidate from the query string, so it is
| wrapped in a Suspense boundary as useSearchParams() requires.
*/
export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center gap-2.5">
          <Spinner className="text-accent" />
          <span className="text-sm text-muted">Loading assistant...</span>
        </div>
      }
    >
      <AssistantWorkspace />
    </Suspense>
  );
}
