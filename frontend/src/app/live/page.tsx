import Link from "next/link";

export default function LivePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Real-Time Conversation Support</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Placeholder UI. This is where the low-latency live listening + subtle cues will live.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="text-base font-semibold tracking-tight">What will appear here</div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
          <li>“Live session” start/stop controls</li>
          <li>On-device mic status + privacy indicators</li>
          <li>Subtle in-call cues (pacing, pronunciation, tone)</li>
          <li>Low-disruption UI for phone usage</li>
        </ul>
        <div className="mt-4">
          <Link
            href="/conversations"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Upload recordings instead (MVP)
          </Link>
        </div>
      </section>
    </div>
  );
}

