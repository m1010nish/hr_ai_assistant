import { cn } from "@/lib/utils";

/*
| Tone carries meaning, but never on its own — every badge also renders a text
| label, so colour-blind users lose nothing.
*/
const TONES = {
  neutral: "bg-canvas text-muted border-line",
  info: "bg-accent-soft text-accent border-accent/25",
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/25",
};

export default function Badge({ tone = "neutral", icon = null, children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium",
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
