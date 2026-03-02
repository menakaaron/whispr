"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { deleteAudioBlob, getAudioBlob, putAudioBlob } from "@/lib/idb";

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

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function hashStringToInt(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededScore(seed: number, salt: number, min: number, max: number) {
  const x = Math.sin((seed + salt) * 12_989.13) * 43758.5453;
  const unit = x - Math.floor(x);
  return clampScore(min + unit * (max - min));
}

function makePlaceholderAnalysis(id: string, filename: string): ConversationAnalysis {
  const seed = hashStringToInt(id + "|" + filename);
  const pronunciation = seededScore(seed, 1, 55, 92);
  const fluency = seededScore(seed, 2, 50, 90);
  const tone = seededScore(seed, 3, 58, 95);

  return {
    overallSummary:
      "Placeholder analysis: upload + playback is wired up. This section will later summarize key pronunciation, fluency, tone, and cultural context insights from the conversation.",
    pronunciationScore: pronunciation,
    fluencyScore: fluency,
    toneScore: tone,
    culturalContextSummary:
      "Placeholder cultural context: identifies when phrases are functional vs literal and highlights hidden social norms to watch for.",
    coachingCues: [
      "Try a slightly slower pace on longer sentences.",
      "Reduce filler words in transitions (e.g., 'um', 'like').",
      "End statements with a clearer downward intonation when you mean certainty.",
    ],
  };
}

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

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
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

    const created: Conversation[] = [];
    for (const file of arr) {
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      const createdAt = new Date(now.getTime()).toISOString();
      const title = file.name.replace(/\.[^/.]+$/, "") || "Conversation";
      const analysis = makePlaceholderAnalysis(id, file.name);

      await putAudioBlob(id, file);

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
  }, [conversations, persist]);

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

