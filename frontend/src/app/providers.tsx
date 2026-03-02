"use client";

import { ConversationsProvider } from "@/state/conversations";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ConversationsProvider>{children}</ConversationsProvider>;
}

