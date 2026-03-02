"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import { TrendChart } from "@/components/charts/TrendChart";
import { UploadPanel } from "@/components/conversations/UploadPanel";
import { useConversations } from "@/state/conversations";

function formatShortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export function DashboardClient() {
  const { conversations } = useConversations();

  const chartData = useMemo(() => {
    const recent = [...conversations].slice(0, 12).reverse();
    return recent.map((c) => ({
      label: formatShortDate(c.createdAt),
      pronunciation: c.analysis.pronunciationScore,
      fluency: c.analysis.fluencyScore,
      tone: c.analysis.toneScore,
    }));
  }, [conversations]);

  const summary = useMemo(() => {
    const recent = conversations.slice(0, 8);
    return {
      count: conversations.length,
      pronunciation: avg(recent.map((c) => c.analysis.pronunciationScore)),
      fluency: avg(recent.map((c) => c.analysis.fluencyScore)),
      tone: avg(recent.map((c) => c.analysis.toneScore)),
    };
  }, [conversations]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Conversations" value={`${summary.count}`} sub="Uploaded to this browser" />
        <KpiCard title="Pronunciation" value={`${summary.pronunciation}`} sub="Avg (recent)" />
        <KpiCard title="Fluency + Tone" value={`${Math.round((summary.fluency + summary.tone) / 2)}`} sub="Avg (recent)" />
      </div>

      <UploadPanel />

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Progress trends</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Placeholder chart based on uploaded conversations (scores will come from Bedrock later).
            </p>
          </div>
          <Link
            href="/conversations"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            View all conversations
          </Link>
        </div>

        <div className="mt-4">
          {chartData.length >= 2 ? (
            <TrendChart data={chartData} />
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-300">
              Upload at least 2 conversations to see trends.
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <LegendDot colorClass="bg-[#0f172a]" label="Pronunciation" />
            <LegendDot colorClass="bg-[#2563eb]" label="Fluency" />
            <LegendDot colorClass="bg-[#16a34a]" label="Tone" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard
          title="Cultural context"
          body="After each conversation, this will highlight unspoken norms (e.g., functional greetings vs literal meanings) and suggest culturally appropriate alternatives."
          href="/conversations"
          cta="See an example"
        />
        <PlaceholderCard
          title="Practice simulations"
          body="This area will host role-play scenarios (interviews, defenses, negotiations) with an AI voice interface and targeted pronunciation drills."
          href="/practice"
          cta="Open practice"
        />
      </section>
    </div>
  );
}

function KpiCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{sub}</div>
    </div>
  );
}

function PlaceholderCard({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="text-base font-semibold tracking-tight">{title}</div>
      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{body}</p>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

function LegendDot({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950/20">
      <span className={`h-2 w-2 rounded-full ${colorClass}`} />
      <span>{label}</span>
    </div>
  );
}

