import { ConversationList } from "@/components/conversations/ConversationList";
import { UploadPanel } from "@/components/conversations/UploadPanel";

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Conversations</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Upload recordings and review post-conversation analysis (placeholder).
        </p>
      </div>

      <UploadPanel />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">History</h2>
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Stored locally in this browser for MVP
        </div>
      </div>

      <ConversationList />
    </div>
  );
}

