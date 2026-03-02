"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useConversations } from "@/state/conversations";

function formatLong(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ConversationDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { getConversation, loadAudioBlob, removeConversation, renameConversation } = useConversations();
  const convo = getConversation(id);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState(convo?.title ?? "");
  const [busyDelete, setBusyDelete] = useState(false);

  useEffect(() => {
    setTitleDraft(convo?.title ?? "");
  }, [convo?.title]);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;

    async function run() {
      setAudioUrl(null);
      const blob = await loadAudioBlob(id);
      if (cancelled) return;
      if (!blob) return;
      url = URL.createObjectURL(blob);
      setAudioUrl(url);
    }

    run();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, loadAudioBlob]);

  const scoreChips = useMemo(() => {
    if (!convo) return [];
    return [
      { label: "Pronunciation", value: convo.analysis.pronunciationScore },
      { label: "Fluency", value: convo.analysis.fluencyScore },
      { label: "Tone", value: convo.analysis.toneScore },
    ];
  }, [convo]);

  if (!convo) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          Conversation not found in this browser.
        </div>
        <Link
          href="/conversations"
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Back to conversations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/conversations" className="font-medium text-zinc-700 hover:underline dark:text-zinc-200">
              Conversations
            </Link>
            <span className="text-zinc-400">/</span>
            <span className="text-zinc-500 dark:text-zinc-400">{formatLong(convo.createdAt)}</span>
          </div>
          <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight">{convo.title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Placeholder post-conversation analysis (wire up Bedrock later).
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            setBusyDelete(true);
            try {
              await removeConversation(convo.id);
              router.push("/conversations");
            } finally {
              setBusyDelete(false);
            }
          }}
          disabled={busyDelete}
          className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/40 dark:bg-zinc-950/20 dark:text-red-200 dark:hover:bg-red-950/30"
        >
          {busyDelete ? "Deleting…" : "Delete"}
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight">Recording</h2>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">{convo.audio.originalFilename}</div>
          </div>
          <div className="mt-3">
            {audioUrl ? (
              <audio controls className="w-full" src={audioUrl} />
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-300">
                Loading audio from local storage…
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {scoreChips.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/30"
              >
                <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">{s.label}</div>
                <div className="mt-0.5 text-sm font-semibold">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-base font-semibold tracking-tight">Edit title</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Rename this conversation for easier tracking.
          </p>
          <div className="mt-3 space-y-2">
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/20 dark:focus:border-zinc-600"
              placeholder="Conversation title"
            />
            <button
              type="button"
              onClick={() => renameConversation(convo.id, titleDraft.trim() || "Conversation")}
              className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Save
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-base font-semibold tracking-tight">Overall summary</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{convo.analysis.overallSummary}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <DetailCard
          title="Pronunciation"
          body="This will later highlight phoneme-level issues, stress patterns, and example replays."
          bullets={["Common mispronounced sounds", "Stress + rhythm patterns", "Targeted drills and audio examples"]}
        />
        <DetailCard
          title="Fluency"
          body="This will later measure pace, pauses, filler words, and turn-taking patterns."
          bullets={["Pace + pausing", "Filler word frequency", "Turn-taking smoothness"]}
        />
        <DetailCard
          title="Tone"
          body="This will later evaluate intonation, politeness strategy, and confidence signals."
          bullets={["Intonation patterns", "Directness vs softness", "Confidence markers (volume/hesitation)"]}
        />
        <DetailCard
          title="Cultural context"
          body={convo.analysis.culturalContextSummary}
          bullets={["Functional vs literal phrases", "Unspoken social norms", "Suggested alternatives for your context"]}
        />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-base font-semibold tracking-tight">Optional real-time cues (placeholder)</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
          In the live mode, WhisprAI will provide subtle cues for pronunciation and pacing with minimal disruption.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Cue label="Pacing" value="Hold 0.5s" />
          <Cue label="Pronunciation" value="Try “th”" />
          <Cue label="Tone" value="Softer close" />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-base font-semibold tracking-tight">Coaching cues (placeholder)</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
          {convo.analysis.coachingCues.map((cue) => (
            <li key={cue} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/30">
              {cue}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DetailCard({ title, body, bullets }: { title: string; body: string; bullets: string[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="text-base font-semibold tracking-tight">{title}</div>
      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{body}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

function Cue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/30">
      <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

