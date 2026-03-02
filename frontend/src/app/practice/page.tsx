export default function PracticePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Practice</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Placeholder UI. This will host high-stakes simulations (interviews, defenses) with AI voice responses.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="text-base font-semibold tracking-tight">Scenario picker (placeholder)</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Scenario title="Job interview" body="Practice concise answers, confident tone, and culturally appropriate phrasing." />
          <Scenario title="Academic defense" body="Practice formal register, hedging, and handling tough follow-ups." />
          <Scenario title="Networking" body="Practice small talk openings and smooth transitions." />
          <Scenario title="Conflict resolution" body="Practice de-escalation language and polite firmness." />
        </div>
      </section>
    </div>
  );
}

function Scenario({ title, body }: { title: string; body: string }) {
  return (
    <button
      type="button"
      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/40"
    >
      <div className="text-sm font-semibold tracking-tight">{title}</div>
      <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{body}</div>
      <div className="mt-3 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        Start (coming soon)
      </div>
    </button>
  );
}

