import { ConversationDetailClient } from "@/components/conversations/ConversationDetailClient";

export default async function ConversationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ConversationDetailClient id={params.id} />;
}

