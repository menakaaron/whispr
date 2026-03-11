"use client";

import React, { useEffect, useState } from "react";
import { createUser, getUser } from "@/lib/api";
import { useAuth } from "@/state/auth";

const LANGUAGES = ["English", "Spanish", "Mandarin", "French", "German", "Japanese", "Korean", "Other"];
const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Fluent"];
const LEARNING_GOALS = [
  "Improve pronunciation",
  "Build fluency",
  "Understand cultural norms",
  "Prepare for interviews",
  "Daily conversation",
  "Academic / formal settings",
];

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
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nativeLanguage: "",
    targetLanguage: "",
    proficiencyLevel: "",
    learningGoals: [] as string[],
  });

  useEffect(() => {
    if (!user?.sub) {
      setProfile(null);
      setProfileError(null);
      setProfileNotFound(false);
      return;
    }
    let cancelled = false;
    getUser(user.sub)
      .then((data) => {
        if (!cancelled) {
          setProfile(data as typeof profile);
          setProfileNotFound(false);
        }
      })
      .catch(async (err) => {
        if (!cancelled) {
          const errorMsg = err instanceof Error ? err.message : "Failed to load profile";
          if (errorMsg.includes("404") || errorMsg.includes("not found")) {
            // Auto-create profile if it doesn't exist
            try {
              await createUser({
                userId: user.sub,
                email: user.email || "",
                nativeLanguage: "English",
                targetLanguage: "Spanish",
                proficiencyLevel: "Beginner",
                learningGoals: ["Conversational fluency"],
              });
              const data = await getUser(user.sub);
              if (!cancelled) {
                setProfile(data as typeof profile);
                setProfileNotFound(false);
              }
            } catch (createErr) {
              if (!cancelled) {
                setProfileError(createErr instanceof Error ? createErr.message : "Failed to create profile");
              }
            }
          } else {
            setProfileError(errorMsg);
            setProfileNotFound(false);
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.sub, user?.email]);

  const handleEditClick = () => {
    if (profile) {
      setEditForm({
        nativeLanguage: profile.nativeLanguage || "English",
        targetLanguage: profile.targetLanguage || "Spanish",
        proficiencyLevel: profile.proficiencyLevel || "Beginner",
        learningGoals: profile.learningGoals || [],
      });
      setIsEditing(true);
    }
  };

  const toggleGoal = (goal: string) => {
    setEditForm((prev) => ({
      ...prev,
      learningGoals: prev.learningGoals.includes(goal)
        ? prev.learningGoals.filter((g) => g !== goal)
        : [...prev.learningGoals, goal],
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.sub || !user?.email) return;
    setIsCreating(true);
    setProfileError(null);
    try {
      await createUser({
        userId: user.sub,
        email: user.email,
        nativeLanguage: editForm.nativeLanguage,
        targetLanguage: editForm.targetLanguage,
        proficiencyLevel: editForm.proficiencyLevel,
        learningGoals: editForm.learningGoals.length > 0 ? editForm.learningGoals : ["Conversational fluency"],
      });
      const data = await getUser(user.sub);
      setProfile(data as typeof profile);
      setIsEditing(false);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Profile and preferences. When logged in, your profile is loaded from the backend.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold tracking-tight">Profile</div>
          {user && profile && (
            <button
              onClick={handleEditClick}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Edit Profile
            </button>
          )}
        </div>
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
        {user && !profile && !profileError && !profileNotFound && (
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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold tracking-tight">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Native language
                </label>
                <select
                  value={editForm.nativeLanguage}
                  onChange={(e) => setEditForm({ ...editForm, nativeLanguage: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/30 dark:focus:border-zinc-600"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Target language
                </label>
                <select
                  value={editForm.targetLanguage}
                  onChange={(e) => setEditForm({ ...editForm, targetLanguage: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/30 dark:focus:border-zinc-600"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Proficiency level
                </label>
                <select
                  value={editForm.proficiencyLevel}
                  onChange={(e) => setEditForm({ ...editForm, proficiencyLevel: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/30 dark:focus:border-zinc-600"
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Learning goals
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LEARNING_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        editForm.learningGoals.includes(goal)
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                          : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isCreating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
