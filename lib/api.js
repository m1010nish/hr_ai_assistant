/*
|--------------------------------------------------------------------------
| API client
|--------------------------------------------------------------------------
|
| The browser only ever talks to our own Express API. Cloudinary, MongoDB and
| Gemini are reached by the backend, so no third-party credentials are ever
| present in this bundle.
|
| Every request in the application goes through this module so that base URL,
| error shaping and JSON handling stay consistent.
|
*/

const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/* Tolerate a trailing slash in the environment variable. */
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status = 0, code = "api_error", details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isNetworkError() {
    return this.code === "network_error";
  }

  get isNotFound() {
    return this.status === 404;
  }
}

function buildUrl(path, query) {
  const base = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  if (!query) return base;

  const search = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const qs = search.toString();

  return qs ? `${base}?${qs}` : base;
}

/*
| The backend answers with { success, data, message }. Anything else — an HTML
| error page from a proxy, an empty body, a crashed process — is normalised
| into an ApiError so the UI never has to guess.
*/
async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let payload = null;

  if (isJson) {
    try {
      payload = await response.json();
    } catch {
      throw new ApiError("The server returned an unreadable response.", {
        status: response.status,
        code: "parse_error",
      });
    }
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message || defaultMessageForStatus(response.status),
      {
        status: response.status,
        code: "http_error",
        details: payload,
      }
    );
  }

  if (!isJson) {
    throw new ApiError("The server returned an unexpected response format.", {
      status: response.status,
      code: "parse_error",
    });
  }

  if (payload && payload.success === false) {
    throw new ApiError(payload.message || "The request could not be completed.", {
      status: response.status,
      code: "api_error",
      details: payload,
    });
  }

  return payload;
}

function defaultMessageForStatus(status) {
  if (status === 400) return "The request was rejected as invalid.";
  if (status === 404) return "The requested record could not be found.";
  if (status === 413) return "The uploaded file is too large.";
  if (status === 422) return "The file could not be read.";
  if (status >= 500) return "The server encountered a problem.";
  return "The request could not be completed.";
}

async function request(path, { method = "GET", body, query, signal } = {}) {
  const url = buildUrl(path, query);

  let response;

  try {
    response = await fetch(url, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    /* An aborted request is a normal part of the UI lifecycle, not a failure. */
    if (error?.name === "AbortError") throw error;

    throw new ApiError(
      "Unable to reach the server. Check your connection and try again.",
      { code: "network_error" }
    );
  }

  return parseResponse(response);
}

export const apiGet = (path, options) => request(path, { ...options, method: "GET" });

export const apiPost = (path, body, options) =>
  request(path, { ...options, method: "POST", body });

export const apiPut = (path, body, options) =>
  request(path, { ...options, method: "PUT", body });

export const apiDelete = (path, options) =>
  request(path, { ...options, method: "DELETE" });

/*
|--------------------------------------------------------------------------
| Multipart upload
|--------------------------------------------------------------------------
|
| fetch() cannot report upload progress, and resume uploads are large enough
| that HR should see the bytes move rather than a frozen dialog. XMLHttpRequest
| is used purely for its progress events.
|
*/
export function apiUpload(path, formData, { onProgress, signal } = {}) {
  const url = buildUrl(path);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let payload = null;

      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        reject(
          new ApiError("The server returned an unreadable response.", {
            status: xhr.status,
            code: "parse_error",
          })
        );
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload?.success !== false) {
        resolve(payload);
        return;
      }

      reject(
        new ApiError(payload?.message || defaultMessageForStatus(xhr.status), {
          status: xhr.status,
          code: "http_error",
          details: payload,
        })
      );
    };

    xhr.onerror = () => {
      reject(
        new ApiError(
          "Unable to reach the server. Check your connection and try again.",
          { code: "network_error" }
        )
      );
    };

    xhr.onabort = () => {
      const error = new Error("Upload cancelled");
      error.name = "AbortError";
      reject(error);
    };

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(formData);
  });
}

/*
|--------------------------------------------------------------------------
| Endpoints
|--------------------------------------------------------------------------
|
| Every backend route the application uses is declared here. Components call
| these functions; they never build URLs themselves.
|
*/

export const candidatesApi = {
  /*
   * GET /api/candidates
   *
   * The current backend returns the full active set. `search`, `page` and
   * `limit` are forwarded so that when server-side filtering lands, the
   * calling code does not change — see useCandidates() for the client-side
   * filtering that stands in until then.
   */
  list: ({ search, page, limit, signal } = {}) =>
    apiGet("/candidates", { query: { search, page, limit }, signal }),

  get: (candidateId, { signal } = {}) =>
    apiGet(`/candidates/${candidateId}`, { signal }),
};

export const resumesApi = {
  /*
   * POST /api/resumes/upload
   *
   * Multipart. The file field is named `resume`; `name` is required and the
   * remaining candidate fields are optional hints that Gemini's extraction
   * may override.
   */
  upload: (formData, options) => apiUpload("/resumes/upload", formData, options),
};

export const conversationsApi = {
  /* POST /api/conversations */
  create: (body, { signal } = {}) => apiPost("/conversations", body, { signal }),

  /* GET /api/conversations/:conversationId */
  get: (conversationId, { signal } = {}) =>
    apiGet(`/conversations/${conversationId}`, { signal }),

  /* GET /api/conversations/candidate/:candidateId */
  listForCandidate: (candidateId, { signal } = {}) =>
    apiGet(`/conversations/candidate/${candidateId}`, { signal }),

  /* POST /api/conversations/:conversationId/messages */
  sendMessage: (conversationId, question, { signal } = {}) =>
    apiPost(`/conversations/${conversationId}/messages`, { question }, { signal }),
};
