"use client";

import { AuthProvider } from "@/state/auth";
import { ConversationsProvider } from "@/state/conversations";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ConversationsProvider>{children}</ConversationsProvider>
    </AuthProvider>
  );
}

