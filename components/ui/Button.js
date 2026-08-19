import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";

const VARIANTS = {
  primary:
    "bg-accent text-white border border-accent hover:bg-accent-strong hover:border-accent-strong disabled:bg-accent/50 disabled:border-accent/50",
  secondary:
    "bg-surface text-ink border border-line hover:bg-canvas disabled:text-muted",
  ghost:
    "bg-transparent text-body border border-transparent hover:bg-canvas hover:text-ink",
  danger:
    "bg-surface text-danger border border-line hover:bg-danger-soft hover:border-danger/30",
};

const SIZES = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-10 px-4 text-sm gap-2",
};

export default function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap",
        "transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-70",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
}
