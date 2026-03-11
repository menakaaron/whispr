"use client";

import Link from "next/link";
import React from "react";
import { useConversations } from "@/state/conversations";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function bytes(n: number) {
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function ConversationList() {
  const { conversations } = useConversations();

  if (conversations.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
        No conversations yet. Upload an audio recording to create your first analysis.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`/conversations/${c.id}`}
          className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold tracking-tight">{c.title}</div>
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {formatDate(c.createdAt)} • {bytes(c.audio.sizeBytes)} • {c.audio.originalFilename}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:w-[360px]">
              <ScoreChip label="Pronunciation" value={c.analysis.pronunciationScore} />
              <ScoreChip label="Fluency" value={c.analysis.fluencyScore} />
              <ScoreChip label="Tone" value={c.analysis.toneScore} />
            </div>
          </div>
          <div className="mt-3 line-clamp-2 text-sm text-zinc-700 dark:text-zinc-200">
            {c.analysis.overallSummary}
          </div>
        </Link>
      ))}
    </section>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/30">
      <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value === 0 ? "—" : value}</div>
    </div>
  );
}

