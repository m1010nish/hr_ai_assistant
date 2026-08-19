"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { conversationsApi } from "@/lib/api";

let localMessageId = 0;
const nextLocalId = () => `local-${++localMessageId}`;

function normalizeMessage(message, index) {
  return {
    id: message._id || message.id || `msg-${index}`,
    role: message.role,
    content: message.content || "",
    evidence: Array.isArray(message.evidence) ? message.evidence : [],
    gaps: Array.isArray(message.gaps) ? message.gaps : [],
    assessment: message.assessment || null,
    createdAt: message.createdAt || null,
    failed: false,
  };
}

/*
|--------------------------------------------------------------------------
| useConversation
|--------------------------------------------------------------------------
|
| Owns exactly one conversation: its messages, the in-flight question, and the
| send/retry cycle.
|
| A conversation row is only created on the server when HR actually asks
| something. Until then the hook sits in a draft state, so browsing candidates
| never litters the database with empty conversations.
|
| `resumeId` is carried through to the create call. The backend currently
| derives the resume from the candidate and ignores the field, but the UI is
| already resume-aware, so resume-scoped conversations need no rework here.
|
*/
export function useConversation({
  conversationId,
  candidateId,
  resumeId,
  onConversationCreated,
  onConversationUpdated,
} = {}) {
  const key = conversationId || "";

  /*
   * Messages are tagged with the conversation they belong to. A response for
   * a conversation the user has already navigated away from is then simply
   * not the current key, so it is ignored rather than shown under the wrong
   * candidate.
   */
  const [state, setState] = useState({
    key: key || "",
    messages: [],
    error: null,
  });

  /*
   * The id of a conversation whose messages this hook already holds because it
   * created them. Asking the first question turns a draft into a real
   * conversation and puts its id in the URL; without this guard the resulting
   * key change would refetch and briefly blank the exchange that is on screen.
   */
  const localKeyRef = useRef(null);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  /* Kept so "Try again" can resend without the user retyping. */
  const lastQuestionRef = useRef(null);

  useEffect(() => {
    if (!key) return undefined;
    if (localKeyRef.current === key) return undefined;

    const controller = new AbortController();

    conversationsApi
      .get(key, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;

        const list = Array.isArray(response?.data?.messages)
          ? response.data.messages
          : [];

        localKeyRef.current = key;
        setState({ key, messages: list.map(normalizeMessage), error: null });
        setSendError(null);
      })
      .catch((caught) => {
        if (controller.signal.aborted || caught?.name === "AbortError") return;

        localKeyRef.current = key;
        setState({ key, messages: [], error: caught });
      });

    return () => controller.abort();
  }, [key, reloadToken]);

  const settled = state.key === key;
  const messages = settled ? state.messages : [];

  const appendMessage = useCallback((message) => {
    setState((current) => ({ ...current, messages: [...current.messages, message] }));
  }, []);

  const setFailedFlagOnLastQuestion = useCallback((failed) => {
    setState((current) => {
      const next = [...current.messages];

      for (let index = next.length - 1; index >= 0; index -= 1) {
        if (next[index].role === "user") {
          next[index] = { ...next[index], failed };
          break;
        }
      }

      return { ...current, messages: next };
    });
  }, []);

  const runSend = useCallback(
    async (question, { appendUserMessage }) => {
      setSending(true);
      setSendError(null);
      lastQuestionRef.current = question;

      if (appendUserMessage) {
        appendMessage({
          id: nextLocalId(),
          role: "user",
          content: question,
          evidence: [],
          gaps: [],
          assessment: null,
          createdAt: new Date().toISOString(),
          failed: false,
        });
      } else {
        setFailedFlagOnLastQuestion(false);
      }

      let targetConversationId = conversationId;

      try {
        if (!targetConversationId) {
          if (!candidateId) throw new Error("No candidate selected.");

          const created = await conversationsApi.create({ candidateId, resumeId });

          targetConversationId = created?.data?.id || created?.data?._id;

          if (!targetConversationId) {
            throw new Error("The conversation could not be started.");
          }

          /*
           * Adopt the new id and publish it in the same tick, so the state key
           * and the URL move together and the effect above skips its refetch.
           */
          localKeyRef.current = targetConversationId;
          setState((current) => ({ ...current, key: targetConversationId }));

          onConversationCreated?.({
            _id: targetConversationId,
            title: created?.data?.title || "New conversation",
            createdAt: created?.data?.createdAt || new Date().toISOString(),
            updatedAt: created?.data?.createdAt || new Date().toISOString(),
          });
        }

        const response = await conversationsApi.sendMessage(
          targetConversationId,
          question
        );

        const answer = response?.data?.message;

        if (!answer) throw new Error("The assistant returned an empty response.");

        appendMessage(normalizeMessage(answer, Date.now()));
        lastQuestionRef.current = null;

        /*
         * The backend titles a fresh conversation from its first question.
         * Mirror that locally so the sidebar matches without a refetch.
         */
        onConversationUpdated?.(targetConversationId, {
          title: question.length > 60 ? `${question.slice(0, 57)}...` : question,
          updatedAt: new Date().toISOString(),
        });

        return { ok: true, conversationId: targetConversationId };
      } catch (caught) {
        setSendError(caught);
        setFailedFlagOnLastQuestion(true);
        return { ok: false };
      } finally {
        setSending(false);
      }
    },
    [
      conversationId,
      candidateId,
      resumeId,
      appendMessage,
      setFailedFlagOnLastQuestion,
      onConversationCreated,
      onConversationUpdated,
    ]
  );

  const sendMessage = useCallback(
    (rawQuestion) => {
      const question = rawQuestion?.trim();
      if (!question || sending) return Promise.resolve({ ok: false });
      return runSend(question, { appendUserMessage: true });
    },
    [runSend, sending]
  );

  const retry = useCallback(() => {
    const question = lastQuestionRef.current;
    if (!question || sending) return Promise.resolve({ ok: false });
    return runSend(question, { appendUserMessage: false });
  }, [runSend, sending]);

  const reload = useCallback(() => {
    localKeyRef.current = null;
    setReloadToken((token) => token + 1);
  }, []);

  return {
    messages,
    isLoading: Boolean(key) && !settled,
    isLoadError: settled && Boolean(state.error),
    loadError: settled ? state.error : null,
    sending,
    sendError,
    sendMessage,
    retry,
    reload,
  };
}
