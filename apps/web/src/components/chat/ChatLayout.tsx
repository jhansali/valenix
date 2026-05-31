"use client";

import { LogOut, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/use-auth";
import type { ConversationSummary } from "@/types/api";

export function ChatLayout({
  children,
  activeConversationId
}: {
  children: ReactNode;
  activeConversationId?: string;
}) {
  const router = useRouter();
  const { user, loading } = useAuth({ required: true });
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      api.listConversations().then(setConversations).catch(() => setConversations([]));
    }
  }, [loading, user]);

  async function createChat() {
    if (creatingChat) return;

    setCreatingChat(true);
    try {
      const conversation = await api.createConversation();
      setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]);
      router.push(`/chat/${conversation.id}`);
      router.refresh();
    } finally {
      setCreatingChat(false);
    }
  }

  async function logout() {
    await api.logout();
    router.replace("/login");
  }

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="hidden w-72 shrink-0 border-r border-line bg-panel md:flex md:flex-col">
        <div className="border-b border-line p-3">
          <button
            onClick={createChat}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line bg-white text-sm font-medium text-ink hover:bg-gray-50"
            disabled={creatingChat}
            title="New chat"
          >
            <MessageSquarePlus size={18} />
            New Chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/chat/${conversation.id}`}
              className={`block truncate rounded-md px-3 py-2 text-sm ${
                activeConversationId === conversation.id
                  ? "bg-white font-medium text-ink shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              {conversation.title}
            </Link>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="mb-3 truncate text-xs text-gray-500">{user?.email}</div>
          <button
            onClick={logout}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md text-sm text-gray-600 hover:bg-white"
            title="Log out"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex h-screen min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-line px-3 md:hidden">
          <button
            onClick={createChat}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-white text-ink"
            title="New chat"
          >
            <MessageSquarePlus size={17} />
          </button>
          <select
            className="h-9 min-w-0 flex-1 rounded-md border border-line bg-white px-2 text-sm text-ink"
            onChange={(event) => {
              if (event.target.value) router.push(`/chat/${event.target.value}`);
            }}
            value={activeConversationId || ""}
            aria-label="Chat history"
          >
            <option value="">New chat</option>
            {conversations.map((conversation) => (
              <option key={conversation.id} value={conversation.id}>
                {conversation.title}
              </option>
            ))}
          </select>
          <button
            onClick={logout}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-gray-600"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
