"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { conversationsApi } from "@/lib/api";

function normalizeSummary(conversation) {
  if (!conversation) return null;

  return {
    id: conversation._id || conversation.id,
    title: conversation.title || "New conversation",
    createdAt: conversation.createdAt || null,
    updatedAt: conversation.updatedAt || conversation.createdAt || null,
  };
}

function byNewestFirst(a, b) {
  return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
}

/*
|--------------------------------------------------------------------------
| useConversations
|--------------------------------------------------------------------------
|
| The conversation *list* for one candidate. Only titles and timestamps are
| fetched here — message bodies are loaded by useConversation() for the single
| conversation that is actually open.
|
| Results are keyed by candidate id so that a response arriving after the user
| has moved on is discarded rather than shown against the wrong candidate.
|
*/
export function useConversations(candidateId) {
  const [result, setResult] = useState({
    key: candidateId ? null : "",
    list: [],
    error: null,
  });
  const [reloadToken, setReloadToken] = useState(0);

  const key = candidateId || "";

  useEffect(() => {
    if (!key) return undefined;

    const controller = new AbortController();

    conversationsApi
      .listForCandidate(key, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;

        const list = Array.isArray(response?.data) ? response.data : [];

        setResult({
          key,
          list: list.map(normalizeSummary).filter(Boolean).sort(byNewestFirst),
          error: null,
        });
      })
      .catch((caught) => {
        if (controller.signal.aborted || caught?.name === "AbortError") return;
        setResult({ key, list: [], error: caught });
      });

    return () => controller.abort();
  }, [key, reloadToken]);

  const settled = result.key === key;

  const conversations = settled ? result.list : [];

  /*
   * Applied after a message is sent: the backend renames "New conversation"
   * using the first question and bumps updatedAt, so the list is corrected in
   * place rather than refetched.
   */
  const applyLocalUpdate = useCallback((conversationId, patch) => {
    setResult((current) => ({
      ...current,
      list: current.list
        .map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, ...patch }
            : conversation
        )
        .sort(byNewestFirst),
    }));
  }, []);

  const addConversation = useCallback((conversation) => {
    const summary = normalizeSummary(conversation);
    if (!summary) return;

    setResult((current) => ({
      ...current,
      list: [summary, ...current.list.filter((item) => item.id !== summary.id)],
    }));
  }, []);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    conversations,
    isLoading: Boolean(key) && !settled,
    isError: settled && Boolean(result.error),
    isEmpty: settled && !result.error && conversations.length === 0,
    error: settled ? result.error : null,
    reload,
    addConversation,
    applyLocalUpdate,
  };
}

/*
|--------------------------------------------------------------------------
| useRecentConversations
|--------------------------------------------------------------------------
|
| Powers the dashboard's activity list. The API exposes conversations per
| candidate only, so this samples a small, fixed number of the most recently
| added candidates rather than fanning out across the whole database — the
| request count stays constant no matter how many candidates exist.
|
| The dashboard labels the figure as a sample for exactly this reason. A
| GET /api/conversations route would replace this with a single call.
|
*/
export function useRecentConversations(
  candidates,
  { sampleSize = 8, limit = 6 } = {}
) {
  const [result, setResult] = useState({ key: null, list: [], error: null });

  const sample = useMemo(
    () => candidates.slice(0, sampleSize),
    [candidates, sampleSize]
  );

  const sampleKey = sample.map((candidate) => candidate.id).join(",");

  useEffect(() => {
    const controller = new AbortController();
    const ids = sampleKey ? sampleKey.split(",") : [];

    Promise.all(
      ids.map((candidateId) =>
        conversationsApi
          .listForCandidate(candidateId, { signal: controller.signal })
          .then((response) => ({
            candidateId,
            list: Array.isArray(response?.data) ? response.data : [],
          }))
          /* One candidate failing must not blank the whole panel. */
          .catch(() => ({ candidateId, list: [] }))
      )
    )
      .then((results) => {
        if (controller.signal.aborted) return;

        const flattened = results
          .flatMap(({ candidateId, list }) =>
            list.map((conversation) => ({
              ...normalizeSummary(conversation),
              candidateId,
            }))
          )
          .sort(byNewestFirst);

        setResult({ key: sampleKey, list: flattened.slice(0, limit), error: null });
      })
      .catch((caught) => {
        if (controller.signal.aborted) return;
        setResult({ key: sampleKey, list: [], error: caught });
      });

    return () => controller.abort();
  }, [sampleKey, limit]);

  const settled = result.key === sampleKey;

  return {
    conversations: settled ? result.list : [],
    isLoading: !settled,
    isError: settled && Boolean(result.error),
    sampledCandidates: sample.length,
  };
}
