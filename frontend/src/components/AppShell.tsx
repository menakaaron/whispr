"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "@/state/auth";

type NavItem = { href: string; label: string; shortLabel?: string };

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", shortLabel: "Home" },
  { href: "/conversations", label: "Conversations", shortLabel: "Uploads" },
  { href: "/live", label: "Real-Time Support", shortLabel: "Live" },
  { href: "/practice", label: "Practice", shortLabel: "Practice" },
  { href: "/settings", label: "Settings", shortLabel: "Settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <span className="text-sm font-semibold tracking-tight">W</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">WhisprAI</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Language + culture coach</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {!loading && (
              user ? (
                <div className="relative ml-2">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    {user.email}
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                        <button
                          type="button"
                          onClick={() => {
                            signOut();
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          Log out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={cn(
                      "rounded-full px-3 py-2 text-sm font-medium transition",
                      pathname === "/login"
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900",
                    )}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Sign up
                  </Link>
                </>
              )
            )}
          </nav>
          {!loading && !user && (
            <div className="flex items-center gap-2 md:hidden">
              <Link href="/login" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Log in</Link>
              <Link href="/signup" className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">Sign up</Link>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:pb-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/70 bg-white/90 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/80 md:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-5 px-2 py-2">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium",
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                )}
              >
                <span className="truncate">{item.shortLabel ?? item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

