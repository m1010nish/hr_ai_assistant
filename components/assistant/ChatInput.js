"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 160;

export default function ChatInput({
  onSend,
  disabled = false,
  sending = false,
  candidateName,
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  /* Grow with the content up to a ceiling, then scroll. */
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;

    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !disabled && !sending;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  };

  const onKeyDown = (event) => {
    /* Enter sends, Shift+Enter inserts a newline. */
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="border-t border-line bg-surface px-4 py-3 lg:px-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div
        className={cn(
          "flex items-end gap-2 rounded-lg border bg-surface px-3 py-2 transition-colors",
          disabled ? "border-line bg-canvas" : "border-line focus-within:border-accent"
        )}
      >
        <label htmlFor="assistant-question" className="sr-only">
          {candidateName
            ? `Ask a question about ${candidateName}'s resume`
            : "Ask a question about this candidate"}
        </label>

        <textarea
          id="assistant-question"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about this candidate..."
          className="max-h-40 min-h-[24px] w-full resize-none bg-transparent text-sm leading-relaxed text-ink placeholder:text-muted focus:outline-none disabled:cursor-not-allowed"
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!canSend}
          loading={sending}
          aria-label="Send question"
        >
          {sending ? "Analyzing resume..." : "Send"}
          {sending ? null : (
            <SendHorizonal className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          )}
        </Button>
      </div>

      <p className="mt-1.5 text-xs text-muted">
        Answers are generated from the selected resume only. Enter to send,
        Shift + Enter for a new line.
      </p>
    </form>
  );
}
