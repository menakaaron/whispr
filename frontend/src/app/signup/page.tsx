"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "@/state/auth";

const LANGUAGES = ["English", "Spanish", "Mandarin", "French", "German", "Japanese", "Korean", "Other"];
const PROFICIENCY_LEVELS = ["beginner", "intermediate", "advanced", "fluent"];
const LEARNING_GOALS = [
  "Improve pronunciation",
  "Build fluency",
  "Understand cultural norms",
  "Prepare for interviews",
  "Daily conversation",
  "Academic / formal settings",
];

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, error, clearError, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [proficiencyLevel, setProficiencyLevel] = useState("beginner");
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleGoal = (goal: string) => {
    setLearningGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        nativeLanguage,
        targetLanguage,
        proficiencyLevel,
        learningGoals: learningGoals.length > 0 ? learningGoals : ["Improve pronunciation"],
      });
      router.push("/");
      router.refresh();
    } catch {
      // error set in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Sign up for WhisprAI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/30 dark:focus:border-zinc-600"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/30 dark:focus:border-zinc-600"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Native language
            </label>
            <select
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/30 dark:focus:border-zinc-600"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Target language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/30 dark:focus:border-zinc-600"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Proficiency level
            </label>
            <select
              value={proficiencyLevel}
              onChange={(e) => setProficiencyLevel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/30 dark:focus:border-zinc-600"
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Learning goals (optional)
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {LEARNING_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    learningGoals.includes(goal)
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || submitting}
            className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-zinc-900 hover:underline dark:text-white">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
