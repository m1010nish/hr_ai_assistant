"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

const FIELD_STYLES =
  "w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted " +
  "transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 " +
  "disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted";

function FieldShell({ id, label, hint, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-[13px] font-medium text-ink-2">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}

      {children}

      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default function Input({
  label,
  hint,
  error,
  required,
  className,
  id: providedId,
  leadingIcon = null,
  ...props
}) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        {leadingIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-muted"
          >
            {leadingIcon}
          </span>
        ) : null}

        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            FIELD_STYLES,
            "h-9",
            leadingIcon && "pl-8",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className
          )}
          {...props}
        />
      </div>
    </FieldShell>
  );
}

export function Select({
  label,
  hint,
  error,
  required,
  className,
  id: providedId,
  children,
  ...props
}) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(FIELD_STYLES, "h-9 appearance-none pr-8", className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.625rem center",
        }}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function Textarea({
  label,
  hint,
  error,
  required,
  className,
  id: providedId,
  ...props
}) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(FIELD_STYLES, "resize-none py-2 leading-relaxed", className)}
        {...props}
      />
    </FieldShell>
  );
}
