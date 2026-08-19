import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

import Badge from "@/components/ui/Badge";
import { RESUME_STATUS, RESUME_STATUS_META } from "@/lib/constants";

const ICONS = {
  [RESUME_STATUS.PENDING]: Clock,
  [RESUME_STATUS.PROCESSING]: Loader2,
  [RESUME_STATUS.COMPLETED]: CheckCircle2,
  [RESUME_STATUS.FAILED]: XCircle,
};

export default function ResumeStatusBadge({ status }) {
  const meta = RESUME_STATUS_META[status] || RESUME_STATUS_META[RESUME_STATUS.PENDING];
  const Icon = ICONS[status] || Clock;
  const spinning = status === RESUME_STATUS.PROCESSING;

  return (
    <Badge
      tone={meta.tone}
      icon={
        <Icon
          className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      }
    >
      {meta.label}
    </Badge>
  );
}
