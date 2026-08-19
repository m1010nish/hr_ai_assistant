import { CheckCircle2, AlertCircle, CircleDashed, MinusCircle } from "lucide-react";

import Badge from "@/components/ui/Badge";
import { ASSESSMENT, ASSESSMENT_META } from "@/lib/constants";

const ICONS = {
  [ASSESSMENT.SUPPORTED]: CheckCircle2,
  [ASSESSMENT.PARTIALLY_SUPPORTED]: AlertCircle,
  [ASSESSMENT.INSUFFICIENT_INFORMATION]: CircleDashed,
  [ASSESSMENT.NOT_APPLICABLE]: MinusCircle,
};

/*
| Reports how well the selected resume supports the question that was asked.
| "Insufficient information" is deliberately neutral, never red — a silent
| resume is not a negative judgement about a candidate.
*/
export default function AssessmentBadge({ assessment, showDescription = false }) {
  const meta = ASSESSMENT_META[assessment];

  if (!meta) return null;

  const Icon = ICONS[assessment];

  return (
    <div className="flex flex-col gap-1">
      <Badge
        tone={meta.tone}
        icon={
          Icon ? (
            <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          ) : null
        }
      >
        <span className="sr-only">Match assessment: </span>
        {meta.label}
      </Badge>

      {showDescription ? (
        <p className="text-xs text-muted">{meta.description}</p>
      ) : null}
    </div>
  );
}
