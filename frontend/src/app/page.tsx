import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Upload conversations, see placeholder analysis, and track progress over time.
        </p>
      </div>
      <DashboardClient />
    </div>
  );
}
