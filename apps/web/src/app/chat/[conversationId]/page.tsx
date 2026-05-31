import { ChatLayout } from "@/components/chat/ChatLayout";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default async function ConversationPage({
  params
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return (
    <ChatLayout activeConversationId={conversationId}>
      <ChatWindow conversationId={conversationId} />
    </ChatLayout>
  );
}
