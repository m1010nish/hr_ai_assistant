"use client";

import { useCallback, useRef, useState } from "react";

import { resumesApi } from "@/lib/api";
import { UPLOAD_ACCEPTED_MIME_TYPES, UPLOAD_MAX_BYTES } from "@/lib/constants";
import { formatFileSize } from "@/lib/utils";

/*
| Stages shown to HR. The backend does the transfer, the text extraction, the
| Gemini pass and the Cloudinary upload inside a single request, so the UI
| reports transfer progress for real and then holds an honest "processing"
| state for as long as extraction actually takes.
*/
export const UPLOAD_STAGE = {
  IDLE: "idle",
  UPLOADING: "uploading",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export function validateResumeFile(file) {
  if (!file) return "Select a resume file to upload.";

  const nameLooksSupported = /\.(pdf|docx?)$/i.test(file.name);

  /*
   * Some browsers report an empty or generic MIME type for .doc/.docx, so the
   * extension is accepted as a fallback. The backend enforces the real check.
   */
  if (!UPLOAD_ACCEPTED_MIME_TYPES.includes(file.type) && !nameLooksSupported) {
    return "Only PDF, DOC and DOCX files are supported.";
  }

  if (file.size > UPLOAD_MAX_BYTES) {
    return `This file is ${formatFileSize(file.size)}. The limit is ${formatFileSize(
      UPLOAD_MAX_BYTES
    )}.`;
  }

  if (file.size === 0) {
    return "This file is empty.";
  }

  return null;
}

export function useResumeUpload() {
  const [stage, setStage] = useState(UPLOAD_STAGE.IDLE);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const abortRef = useRef(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStage(UPLOAD_STAGE.IDLE);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  /*
   * `fields` carries the candidate details HR typed. Gemini's extraction takes
   * precedence over them on the backend; they are the fallback when the resume
   * itself does not state a value.
   */
  const upload = useCallback(async ({ file, fields = {} }) => {
    const validationError = validateResumeFile(file);

    if (validationError) {
      setError({ message: validationError });
      setStage(UPLOAD_STAGE.FAILED);
      return { ok: false };
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setStage(UPLOAD_STAGE.UPLOADING);
    setProgress(0);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);

    Object.entries(fields).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      formData.append(key, value);
    });

    try {
      const response = await resumesApi.upload(formData, {
        signal: controller.signal,
        onProgress: (percent) => {
          setProgress(percent);
          /* Bytes are in; the wait is now on extraction. */
          if (percent >= 100) setStage(UPLOAD_STAGE.PROCESSING);
        },
      });

      setResult(response?.data || null);
      setStage(UPLOAD_STAGE.COMPLETED);

      return { ok: true, data: response?.data || null };
    } catch (caught) {
      if (caught?.name === "AbortError") {
        setStage(UPLOAD_STAGE.IDLE);
        setProgress(0);
        return { ok: false };
      }

      setError(caught);
      setStage(UPLOAD_STAGE.FAILED);

      return { ok: false };
    } finally {
      abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    stage,
    progress,
    error,
    result,
    upload,
    cancel,
    reset,
    isBusy: stage === UPLOAD_STAGE.UPLOADING || stage === UPLOAD_STAGE.PROCESSING,
  };
}
