"use client";

import { useCallback, useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  UploadCloud,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input, { Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { UPLOAD_STAGE, useResumeUpload, validateResumeFile } from "@/hooks/useResumeUpload";
import {
  RESUME_TEMPLATES,
  UPLOAD_ACCEPT_ATTRIBUTE,
  UPLOAD_MAX_BYTES,
} from "@/lib/constants";
import { cn, fileExtension, formatFileSize } from "@/lib/utils";

const EMPTY_FIELDS = {
  name: "",
  position: "",
  email: "",
  template: "UNKNOWN",
};

function DropZone({ onFile, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(event.dataTransfer.files);
      }}
      className={cn(
        "rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
        dragging ? "border-accent bg-accent-soft" : "border-line-strong bg-canvas",
        disabled && "opacity-60"
      )}
    >
      <UploadCloud
        className="mx-auto h-7 w-7 text-muted"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <p className="mt-2.5 text-sm font-medium text-ink">Upload resume</p>
      <p className="mt-0.5 text-[13px] text-muted">
        Drag a file here, or browse. PDF, DOC or DOCX up to{" "}
        {formatFileSize(UPLOAD_MAX_BYTES)}.
      </p>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={UPLOAD_ACCEPT_ATTRIBUTE}
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          /* Allow re-selecting the same file after a removal. */
          event.target.value = "";
        }}
        id="resume-file-input"
      />

      <Button
        variant="secondary"
        size="sm"
        className="mt-3"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </Button>
    </div>
  );
}

function SelectedFile({ file, onRemove, disabled }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-line bg-canvas text-muted"
      >
        <FileText className="h-4 w-4" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-ink">{file.name}</p>
        <p className="text-xs text-muted">
          {fileExtension(file.name)} · {formatFileSize(file.size)}
        </p>
      </div>

      {!disabled ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className="rounded p-1.5 text-muted transition-colors hover:bg-canvas hover:text-danger"
        >
          <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/*
| Progress reflects what is actually happening: a real byte counter while the
| file transfers, then an indeterminate "processing" state for as long as text
| extraction and the Gemini pass take. Nothing is faked.
*/
function ProgressPanel({ stage, progress }) {
  const uploading = stage === UPLOAD_STAGE.UPLOADING;

  return (
    <div className="rounded-lg border border-line bg-canvas px-4 py-4" aria-live="polite">
      <div className="flex items-center gap-2.5">
        <Spinner size="sm" className="text-accent" />
        <p className="text-[13px] font-medium text-ink">
          {uploading ? "Uploading..." : "Processing resume..."}
        </p>
        {uploading ? (
          <span className="ml-auto text-xs tabular-nums text-muted">{progress}%</span>
        ) : null}
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className={cn(
            "h-full rounded-full bg-accent transition-[width] duration-200",
            !uploading && "animate-pulse"
          )}
          style={{ width: uploading ? `${progress}%` : "100%" }}
        />
      </div>

      <ol className="mt-3 flex flex-col gap-1 text-xs text-muted">
        <li className={cn(uploading ? "font-medium text-ink" : "text-success")}>
          1. Transferring file
        </li>
        <li className={cn(!uploading && "font-medium text-ink")}>
          2. Extracting text and structured resume data
        </li>
        <li>3. Saving the candidate record</li>
      </ol>

      <p className="mt-3 text-xs text-muted">
        Extraction can take up to a minute for a long resume. You can leave this
        dialog open.
      </p>
    </div>
  );
}

export default function ResumeUpload({ open, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [fileError, setFileError] = useState(null);
  const [nameError, setNameError] = useState(null);

  const upload = useResumeUpload();

  const closeAndReset = useCallback(() => {
    if (upload.isBusy) return;
    setFile(null);
    setFields(EMPTY_FIELDS);
    setFileError(null);
    setNameError(null);
    upload.reset();
    onClose();
  }, [onClose, upload]);

  const selectFile = (nextFile) => {
    const validationError = validateResumeFile(nextFile);

    if (validationError) {
      setFileError(validationError);
      setFile(null);
      return;
    }

    setFileError(null);
    setFile(nextFile);

    /* Seed the candidate name from the file name as a starting point. */
    if (!fields.name.trim()) {
      const stem = nextFile.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      setFields((current) => ({ ...current, name: stem.trim() }));
    }
  };

  const submit = async () => {
    if (!file) {
      setFileError("Select a resume file to upload.");
      return;
    }

    if (!fields.name.trim()) {
      setNameError("A candidate name is required.");
      return;
    }

    setNameError(null);

    const result = await upload.upload({ file, fields });

    if (result.ok) onUploaded?.(result.data);
  };

  const completed = upload.stage === UPLOAD_STAGE.COMPLETED;
  const failed = upload.stage === UPLOAD_STAGE.FAILED;

  return (
    <Modal
      open={open}
      onClose={closeAndReset}
      closeOnBackdrop={!upload.isBusy}
      title="Upload resume"
      description="The resume is processed and its details extracted automatically."
      size="md"
      footer={
        completed ? (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setFile(null);
                setFields(EMPTY_FIELDS);
                upload.reset();
              }}
            >
              Upload another
            </Button>
            <Button variant="primary" onClick={closeAndReset}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={closeAndReset} disabled={upload.isBusy}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submit}
              loading={upload.isBusy}
              disabled={upload.isBusy}
            >
              {upload.isBusy ? "Working..." : failed ? "Try again" : "Upload resume"}
            </Button>
          </>
        )
      }
    >
      {completed ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-success/25 bg-success-soft text-success"
          >
            <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
          </span>

          <p className="mt-3 text-sm font-semibold text-ink">
            Resume processed successfully.
          </p>
          <p className="mt-1 text-[13px] text-muted">
            {upload.result?.candidate?.name
              ? `${upload.result.candidate.name} is ready to review in the assistant.`
              : "The candidate is ready to review in the assistant."}
          </p>
        </div>
      ) : upload.isBusy ? (
        <ProgressPanel stage={upload.stage} progress={upload.progress} />
      ) : (
        <div className="flex flex-col gap-4">
          {file ? (
            <SelectedFile
              file={file}
              disabled={upload.isBusy}
              onRemove={() => {
                setFile(null);
                setFileError(null);
              }}
            />
          ) : (
            <DropZone onFile={selectFile} disabled={upload.isBusy} />
          )}

          {fileError ? (
            <p role="alert" className="text-[13px] text-danger">
              {fileError}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Candidate name"
              required
              value={fields.name}
              error={nameError}
              onChange={(event) => {
                setFields((current) => ({ ...current, name: event.target.value }));
                if (nameError) setNameError(null);
              }}
              placeholder="Full name"
            />

            <Input
              label="Position"
              value={fields.position}
              onChange={(event) =>
                setFields((current) => ({ ...current, position: event.target.value }))
              }
              placeholder="e.g. Senior Inspector"
            />

            <Input
              label="Email"
              type="email"
              value={fields.email}
              onChange={(event) =>
                setFields((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="Optional"
            />

            <Select
              label="Resume template"
              hint="Left on auto-detect, the format is recognised from the document."
              value={fields.template}
              onChange={(event) =>
                setFields((current) => ({ ...current, template: event.target.value }))
              }
            >
              {RESUME_TEMPLATES.map((template) => (
                <option key={template} value={template}>
                  {template === "UNKNOWN" ? "Detect automatically" : template}
                </option>
              ))}
            </Select>
          </div>

          <p className="text-xs text-muted">
            Details read from the resume itself take precedence over what you
            enter here.
          </p>

          {failed && upload.error ? (
            <div role="alert" className="rounded-md border border-danger/25 bg-danger-soft px-3.5 py-3">
              <p className="text-[13px] font-medium text-ink">
                Resume processing failed.
              </p>
              <p className="mt-0.5 text-[13px] text-body">{upload.error.message}</p>
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
