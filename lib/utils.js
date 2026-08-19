import { RESUME_STATUS } from "@/lib/constants";

/* Small class-name joiner. Falsy values are dropped. */
export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

export function formatRelativeDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays} d ago`;

  return formatDate(value);
}

export function formatFileSize(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileExtension(fileName) {
  if (!fileName) return "";
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "";
}

export function initialsOf(name) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/*
|--------------------------------------------------------------------------
| Normalisation
|--------------------------------------------------------------------------
|
| The API returns full Mongo documents. Two things matter here:
|
| 1. `resume.extractedText` is the entire resume as raw text and
|    `resume.structuredData` duplicates data already present on the candidate.
|    Neither is needed to render a list, and holding thousands of them in
|    browser memory is exactly what the performance brief warns against, so
|    they are dropped at the boundary and never reach React state.
|
| 2. A candidate currently carries a single populated `cv`. The product will
|    grow to several resumes per candidate, so the UI works against a resume
|    *array* from the start. When the backend starts returning `resumes`, this
|    function picks it up and nothing downstream changes.
|
*/

export function normalizeResume(resume, candidate) {
  if (!resume || typeof resume !== "object") return null;

  return {
    id: resume._id || resume.id,
    candidateId:
      candidate?._id || candidate?.id || resume.candidate?._id || resume.candidate,
    fileName: resume.originalFileName || "Untitled resume",
    template: resume.template || "UNKNOWN",
    mimeType: resume.mimeType || resume.fileType || "",
    status: resume.processingStatus || RESUME_STATUS.PENDING,
    processingError: resume.processingError || null,
    /* Only the backend-issued secure URL is ever used to open a document. */
    secureUrl: resume.cloudinary?.secureUrl || resume.cloudinary?.url || null,
    uploadedAt: resume.uploadedAt || resume.createdAt || null,
    processedAt: resume.processedAt || null,
  };
}

export function normalizeCandidate(candidate) {
  if (!candidate || typeof candidate !== "object") return null;

  const source = Array.isArray(candidate.resumes)
    ? candidate.resumes
    : candidate.cv
      ? [candidate.cv]
      : [];

  const resumes = source
    .map((resume) => normalizeResume(resume, candidate))
    .filter(Boolean);

  return {
    id: candidate._id || candidate.id,
    name: candidate.name || "Unnamed candidate",
    position: candidate.position || "",
    email: candidate.email || "",
    phone: candidate.phone || "",
    city: candidate.city || "",
    country: candidate.country || "",
    summary: candidate.summary || "",
    languages: candidate.languages || [],
    education: candidate.education || [],
    qualifications: candidate.qualifications || [],
    training: candidate.training || [],
    professionalExperience: candidate.professionalExperience || [],
    inspectionExperience: candidate.inspectionExperience || [],
    competencies: candidate.competencies || {},
    serviceProfiles: candidate.serviceProfiles || [],
    resumes,
    createdAt: candidate.createdAt || null,
    updatedAt: candidate.updatedAt || null,
  };
}

/*
| The resume the assistant answers from. The backend selects the most recent
| completed resume for the candidate, so the UI defaults to the same choice
| and lets HR override it when a candidate has more than one.
*/
export function defaultResumeFor(candidate) {
  if (!candidate?.resumes?.length) return null;

  const completed = candidate.resumes.filter(
    (resume) => resume.status === RESUME_STATUS.COMPLETED
  );

  const pool = completed.length ? completed : candidate.resumes;

  return [...pool].sort(
    (a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0)
  )[0];
}

export function findResume(candidate, resumeId) {
  if (!candidate?.resumes?.length) return null;
  return candidate.resumes.find((resume) => resume.id === resumeId) || null;
}

/* Flattens candidates into the resume rows shown on /resumes. */
export function resumeRowsFrom(candidates) {
  return candidates.flatMap((candidate) =>
    candidate.resumes.map((resume) => ({ ...resume, candidate }))
  );
}

export function matchesCandidateSearch(candidate, term) {
  if (!term) return true;

  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  return [
    candidate.name,
    candidate.position,
    candidate.email,
    candidate.city,
    candidate.country,
    ...candidate.resumes.map((resume) => resume.fileName),
  ]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(needle));
}

export function errorMessageFrom(error, fallback) {
  if (!error) return fallback;
  if (error.name === "ApiError" && error.message) return error.message;
  return fallback;
}
