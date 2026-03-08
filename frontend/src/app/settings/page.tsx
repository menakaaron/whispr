"use client";

import React, { useEffect, useState } from "react";
import { getUser } from "@/lib/api";
import { useAuth } from "@/state/auth";

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    email?: string;
    nativeLanguage?: string;
    targetLanguage?: string;
    proficiencyLevel?: string;
    learningGoals?: string[];
  } | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.sub) {
      setProfile(null);
      setProfileError(null);
      return;
    }
    let cancelled = false;
    getUser(user.sub)
      .then((data) => {
        if (!cancelled) setProfile(data as typeof profile);
      })
      .catch((err) => {
        if (!cancelled) setProfileError(err instanceof Error ? err.message : "Failed to load profile");
      });
    return () => {
      cancelled = true;
    };
  }, [user?.sub]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Profile and preferences. When logged in, your profile is loaded from the backend.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="text-base font-semibold tracking-tight">Profile</div>
        {!user && (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to see and edit your profile from the backend.
          </p>
        )}
        {user && profileError && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-200">{profileError}</p>
        )}
        {user && profile && (
          <div className="mt-4 grid gap-3">
            <SettingRow title="Email" value={profile.email ?? "—"} />
            <SettingRow title="Native language" value={profile.nativeLanguage ?? "Not set"} />
            <SettingRow title="Target language" value={profile.targetLanguage ?? "Not set"} />
            <SettingRow title="Proficiency" value={profile.proficiencyLevel ?? "—"} />
            <SettingRow
              title="Learning goals"
              value={Array.isArray(profile.learningGoals) ? profile.learningGoals.join(", ") : "—"}
            />
          </div>
        )}
        {user && !profile && !profileError && (
          <p className="mt-3 text-sm text-zinc-500">Loading profile…</p>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="text-base font-semibold tracking-tight">Preferences (placeholder)</div>
        <div className="mt-4 grid gap-3">
          <SettingRow title="Real-time cues" value="Off (MVP)" />
          <SettingRow title="Data storage" value="Local + backend when signed in" />
        </div>
      </section>
    </div>
  );
}

function SettingRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/30">
      <div className="text-sm font-semibold tracking-tight">{title}</div>
      <div className="max-w-[60%] truncate text-right text-sm text-zinc-700 dark:text-zinc-200">
        {value}
      </div>
    </div>
  );
}
