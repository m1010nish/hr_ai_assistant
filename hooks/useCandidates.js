"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { candidatesApi } from "@/lib/api";
import { CANDIDATES_PAGE_SIZE } from "@/lib/constants";
import { matchesCandidateSearch, normalizeCandidate } from "@/lib/utils";

/*
|--------------------------------------------------------------------------
| useCandidates
|--------------------------------------------------------------------------
|
| Loads the active candidate list once per mount and owns the search term and
| page for whichever view is using it.
|
| Search and pagination run in the browser because the current route returns
| the full active set and ignores query parameters. The seam for moving them
| to the server is this hook alone: `candidatesApi.list()` already accepts
| `search`/`page`/`limit`, so once the API honours them, the fetch moves into
| the effect's dependency list and the slicing below is deleted. Every
| consumer reads the same `candidates` / `page` / `pageCount` surface either
| way, so no component changes.
|
*/
export function useCandidates({ pageSize = CANDIDATES_PAGE_SIZE } = {}) {
  const [candidates, setCandidates] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [search, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    candidatesApi
      .list({ signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;

        const list = Array.isArray(response?.data) ? response.data : [];

        setCandidates(list.map(normalizeCandidate).filter(Boolean));
        setStatus("success");
      })
      .catch((caught) => {
        if (controller.signal.aborted || caught?.name === "AbortError") return;

        setError(caught);
        setStatus("error");
      });

    return () => controller.abort();
  }, [reloadToken]);

  const reload = useCallback(() => {
    setStatus("loading");
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  /* Changing the search term always returns to the first page. */
  const setSearch = useCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const filtered = useMemo(
    () => candidates.filter((candidate) => matchesCandidateSearch(candidate, search)),
    [candidates, search]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  const visible = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return {
    /* Data */
    candidates: visible,
    allCandidates: candidates,
    total: filtered.length,

    /* Request state */
    status,
    error,
    isLoading: status === "loading",
    isError: status === "error",
    isEmpty: status === "success" && candidates.length === 0,
    hasNoMatches:
      status === "success" && candidates.length > 0 && filtered.length === 0,

    /* Search */
    search,
    setSearch,

    /* Pagination */
    page: currentPage,
    pageCount,
    pageSize,
    setPage,

    reload,
  };
}
