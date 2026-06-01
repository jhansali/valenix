"use client";

import { LogOut, MessageSquarePlus, Trash2 } from "lucide-react";
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
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && user.status !== "active") {
      router.replace("/waitlist");
      return;
    }

    if (!loading && user) {
      api.listConversations().then(setConversations).catch(() => setConversations([]));
    }
  }, [loading, router, user]);

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

  async function deleteChat(conversationId: string) {
    if (deletingChatId) return;

    const confirmed = window.confirm("Delete this chat?");
    if (!confirmed) return;

    setDeletingChatId(conversationId);
    try {
      await api.deleteConversation(conversationId);
      setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
      if (activeConversationId === conversationId) {
        router.replace("/chat");
      }
      router.refresh();
    } finally {
      setDeletingChatId(null);
    }
  }

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-gray-500">Loading...</div>;
  }

  const userInitial = (user.name || user.email).trim().charAt(0).toUpperCase();

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
            <div
              key={conversation.id}
              className={`group flex items-center gap-1 rounded-md ${
                activeConversationId === conversation.id
                  ? "bg-white text-ink shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <Link
                href={`/chat/${conversation.id}`}
                prefetch={false}
                className={`min-w-0 flex-1 truncate px-3 py-2 text-sm ${
                  activeConversationId === conversation.id ? "font-medium" : ""
                }`}
                onMouseEnter={() => router.prefetch(`/chat/${conversation.id}`)}
                onFocus={() => router.prefetch(`/chat/${conversation.id}`)}
              >
                {conversation.title}
              </Link>
              <button
                onClick={() => deleteChat(conversation.id)}
                className="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-gray-400 opacity-100 hover:bg-red-50 hover:text-red-600 md:opacity-0 md:group-hover:opacity-100"
                disabled={deletingChatId === conversation.id}
                title="Delete chat"
                aria-label={`Delete ${conversation.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-700">{user.name || "Valenix user"}</div>
              <div className="truncate text-xs text-gray-500">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-gray-500 hover:bg-white hover:text-ink"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
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
          {activeConversationId ? (
            <button
              onClick={() => deleteChat(activeConversationId)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-gray-600"
              disabled={deletingChatId === activeConversationId}
              title="Delete chat"
              aria-label="Delete chat"
            >
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
