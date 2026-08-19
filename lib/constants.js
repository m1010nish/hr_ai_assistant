/*
|--------------------------------------------------------------------------
| Shared domain constants
|--------------------------------------------------------------------------
|
| These mirror the enums defined by the backend models. Keeping them in one
| place means a label or colour change never has to be hunted down across
| components.
|
*/

export const APP_NAME = "HR Assistant";

/* Resume.processingStatus — backend/src/models/resume.model.js */
export const RESUME_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const RESUME_STATUS_META = {
  [RESUME_STATUS.PENDING]: {
    label: "Pending",
    tone: "neutral",
  },
  [RESUME_STATUS.PROCESSING]: {
    label: "Processing",
    tone: "info",
  },
  [RESUME_STATUS.COMPLETED]: {
    label: "Completed",
    tone: "success",
  },
  [RESUME_STATUS.FAILED]: {
    label: "Failed",
    tone: "danger",
  },
};

/* Resume.template — backend/src/models/resume.model.js */
export const RESUME_TEMPLATES = ["BV", "DNV", "LRQA", "OTHER", "UNKNOWN"];

/*
| Message.assessment — backend/src/models/conversation.model.js
|
| Wording is deliberate: the assistant reports how well the resume supports a
| question. It never states whether a candidate should be hired.
*/
export const ASSESSMENT = {
  SUPPORTED: "supported",
  PARTIALLY_SUPPORTED: "partially_supported",
  INSUFFICIENT_INFORMATION: "insufficient_information",
  NOT_APPLICABLE: "not_applicable",
};

export const ASSESSMENT_META = {
  [ASSESSMENT.SUPPORTED]: {
    label: "Supported by resume",
    tone: "success",
    description: "The resume contains direct evidence for this question.",
  },
  [ASSESSMENT.PARTIALLY_SUPPORTED]: {
    label: "Partially supported",
    tone: "warning",
    description: "The resume contains related but incomplete evidence.",
  },
  [ASSESSMENT.INSUFFICIENT_INFORMATION]: {
    label: "Insufficient information",
    tone: "neutral",
    description:
      "The resume does not contain enough information to answer. This is not a judgement about the candidate.",
  },
  [ASSESSMENT.NOT_APPLICABLE]: {
    label: "Not applicable",
    tone: "neutral",
    description: "The question does not apply to this resume.",
  },
};

/*
| Mirrors multer's fileFilter + limits in backend/src/middleware/upload.middleware.js.
|
| 4.5 MB is Vercel's serverless request body ceiling — above it the platform
| rejects the upload before the API sees it, so promising more here would set
| HR up for an error we cannot explain.
*/
export const UPLOAD_MAX_BYTES = 4.5 * 1024 * 1024;

export const UPLOAD_ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const UPLOAD_ACCEPT_ATTRIBUTE = ".pdf,.doc,.docx";

/* Client-side page size for the candidate list. */
export const CANDIDATES_PAGE_SIZE = 25;
