"use client";

import { api } from "./apiClient";

// All backend calls use the authenticated apiClient (JWT attached when user is logged in).

// ── Users ──────────────────────────────────────────────────────────────────

export async function createUser(data: {
  email: string;
  nativeLanguage: string;
  targetLanguage: string;
  proficiencyLevel: string;
  learningGoals: string[];
}): Promise<{ userId: string }> {
  return api.post<{ userId: string }>("/users", data);
}

export async function getUser(userId: string) {
  return api.get(`/users/${userId}`);
}

// ── Conversations ──────────────────────────────────────────────────────────

export async function saveConversation(data: {
  userId: string;
  transcriptRaw: string;
  durationSeconds?: number;
  context?: string;
}): Promise<{ conversationId: string; createdAt: string }> {
  return api.post("/conversations", {
    userId: data.userId,
    transcriptRaw: data.transcriptRaw,
    durationSeconds: data.durationSeconds ?? 0,
    context: data.context ?? "general",
  });
}

export async function analyzeCulture(data: {
  conversationId: string;
  transcript: string;
  nativeLanguage: string;
  targetLanguage: string;
  userId: string;
  createdAt: string;
}): Promise<{ conversationId: string; analysis: Record<string, unknown> }> {
  return api.post("/analyze", data);
}

// ── Feedback ───────────────────────────────────────────────────────────────

export async function saveFeedback(data: {
  conversationId: string;
  feedbackType: string;
  insights?: string[];
  suggestions?: string[];
  severity?: string;
  generatedBy?: string;
}) {
  return api.post("/feedback", data);
}

// ── Progress ───────────────────────────────────────────────────────────────

export async function getProgress(userId: string) {
  return api.get(`/progress/${userId}`);
}

// ── Upload & transcribe (speech-to-text) ────────────────────────────────────

export async function getUploadUrl(data: {
  userId: string;
  contentType: string;
}): Promise<{ uploadUrl: string; s3Key: string; fileId: string }> {
  return api.post("/upload-url", data);
}

export async function startTranscribe(data: {
  s3Key: string;
  userId: string;
  conversationId: string;
  createdAt: string;
  languageCode?: string;
  mediaFormat?: string;
}): Promise<{ jobName: string; conversationId: string }> {
  return api.post("/transcribe", data);
}

export async function getTranscribeResult(conversationId: string): Promise<
  | { status: "COMPLETED"; transcript: string }
  | { status: "IN_PROGRESS" }
  | { status: "FAILED"; error: string }
  | { status: "NOT_FOUND"; error: string }
> {
  return api.get(`/transcribe/result/${conversationId}`);
}

// ── Practice (Bedrock simulation) ──────────────────────────────────────────

export async function practiceSimulation(data: Record<string, unknown>) {
  return api.post("/practice", data);
}
