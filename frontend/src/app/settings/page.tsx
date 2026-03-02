export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Placeholder UI. Personalization, privacy, and notification preferences will live here.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="text-base font-semibold tracking-tight">Preferences (placeholder)</div>
        <div className="mt-4 grid gap-3">
          <SettingRow title="Native language" value="Not set" />
          <SettingRow title="Target language" value="Not set" />
          <SettingRow title="Region / cultural context" value="Not set" />
          <SettingRow title="Real-time cues" value="Off (MVP)" />
          <SettingRow title="Data storage" value="Local browser only (MVP)" />
        </div>
      </section>
    </div>
  );
}

function SettingRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/30">
      <div className="text-sm font-semibold tracking-tight">{title}</div>
      <div className="text-sm text-zinc-700 dark:text-zinc-200">{value}</div>
    </div>
  );
}

