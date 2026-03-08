import { ConversationDetailClient } from "@/components/conversations/ConversationDetailClient";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConversationDetailClient id={id} />;
}

