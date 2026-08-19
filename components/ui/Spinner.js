import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-3.5 w-3.5 border-2",
  md: "h-4 w-4 border-2",
  lg: "h-6 w-6 border-2",
};

export default function Spinner({ size = "md", className, label }) {
  return (
    <span
      role="status"
      aria-label={label || "Loading"}
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent align-[-0.125em]",
        SIZES[size],
        className
      )}
    />
  );
}
