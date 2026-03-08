"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "@/state/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, error, clearError, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.push("/");
      router.refresh();
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Use your WhisprAI account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="login-email"
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
            <label htmlFor="login-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/30 dark:focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading || submitting}
            className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don’t have an account?{" "}
          <Link href="/signup" className="font-semibold text-zinc-900 hover:underline dark:text-white">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
