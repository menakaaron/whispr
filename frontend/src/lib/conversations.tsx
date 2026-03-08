"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { deleteAudioBlob, getAudioBlob, putAudioBlob } from "@/lib/idb";
import { processConversation } from "@/lib/api";
import { getOrCreateUserId } from "@/lib/user";
import { useAuth } from "@/state/auth";

export type ConversationAnalysis = {
  overallSummary: string;
  pronunciationScore: number; // 0-100
  fluencyScore: number; // 0-100
  toneScore: number; // 0-100
  culturalContextSummary: string;
  coachingCues: string[];
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string; // ISO
  audio: {
    mimeType: string;
    sizeBytes: number;
    originalFilename: string;
  };
  analysis: ConversationAnalysis;
};

type ConversationsContextValue = {
  conversations: Conversation[];
  addAudioFiles: (files: FileList | File[]) => Promise<void>;
  removeConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => void;
  getConversation: (id: string) => Conversation | undefined;
  loadAudioBlob: (id: string) => Promise<Blob | null>;
};

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

const STORAGE_KEY = "whisprai_conversations_v1";

function loadInitialConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c) => c && typeof c.id === "string")
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}

/**
 * Convert a raw feedback string like "Clear pronunciation with good pacing"
 * into a rough 0-100 score based on positive/negative keywords.
 */
function feedbackToScore(text: string, fallback: number): number {
  if (!text) return fallback;
  const lower = text.toLowerCase();
  if (lower.includes("excellent") || lower.includes("outstanding")) return 92;
  if (lower.includes("good") || lower.includes("clear") || lower.includes("natural")) return 80;
  if (lower.includes("improving") || lower.includes("moderate")) return 65;
  if (lower.includes("needs work") || lower.includes("difficult") || lower.includes("unclear")) return 45;
  return fallback;
}

/**
 * Parse the AI feedback from Bedrock into our ConversationAnalysis shape.
 */
function parseFeedback(
  feedback: { pronunciation: string; fluency: string; culturalContext: string },
  transcript: string
): ConversationAnalysis {
  return {
    overallSummary: transcript,
    pronunciationScore: feedbackToScore(feedback.pronunciation, 70),
    fluencyScore: feedbackToScore(feedback.fluency, 70),
    toneScore: 70, // Not returned by backend yet
    culturalContextSummary: feedback.culturalContext,
    coachingCues: [
      feedback.pronunciation,
      feedback.fluency,
    ].filter(Boolean),
  };
}

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadInitialConversations(),
  );

  const persist = useCallback((next: Conversation[]) => {
    setConversations(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // If storage is unavailable/quota exceeded, keep in-memory state.
    }
  }, []);

  const addAudioFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const now = new Date();
    const userId = user ? user.sub : await getOrCreateUserId();

    const created: Conversation[] = [];

    for (const file of arr) {
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      const createdAt = new Date(now.getTime()).toISOString();
      const title = file.name.replace(/\.[^/.]+$/, "") || "Conversation";

      // Save audio locally for playback
      await putAudioBlob(id, file);

      let analysis: ConversationAnalysis;

      try {
        // Call the real AI backend
        const result = await processConversation({
          userId,
          audioKey: file.name,
        });

        analysis = parseFeedback(result.feedback, result.transcript);
      } catch (err) {
        console.error("Backend analysis failed, using placeholder:", err);
        // Fallback to placeholder if API fails
        analysis = {
          overallSummary: "Analysis unavailable — backend could not be reached.",
          pronunciationScore: 70,
          fluencyScore: 70,
          toneScore: 70,
          culturalContextSummary: "Cultural context analysis unavailable.",
          coachingCues: ["Try again later when the backend is available."],
        };
      }

      created.push({
        id,
        title,
        createdAt,
        audio: {
          mimeType: file.type || "audio/*",
          sizeBytes: file.size,
          originalFilename: file.name,
        },
        analysis,
      });
    }

    persist([...created, ...conversations].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
  }, [conversations, persist, user]);

  const removeConversation = useCallback(
    async (id: string) => {
      await deleteAudioBlob(id);
      persist(conversations.filter((c) => c.id !== id));
    },
    [conversations, persist],
  );

  const renameConversation = useCallback(
    (id: string, title: string) => {
      const next = conversations.map((c) => (c.id === id ? { ...c, title } : c));
      persist(next);
    },
    [conversations, persist],
  );

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations],
  );

  const loadAudioBlob = useCallback(async (id: string) => await getAudioBlob(id), []);

  const value = useMemo<ConversationsContextValue>(
    () => ({
      conversations,
      addAudioFiles,
      removeConversation,
      renameConversation,
      getConversation,
      loadAudioBlob,
    }),
    [addAudioFiles, conversations, getConversation, loadAudioBlob, removeConversation, renameConversation],
  );

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error("useConversations must be used within ConversationsProvider");
  return ctx;
}
