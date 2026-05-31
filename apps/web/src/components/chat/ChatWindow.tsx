"use client";

import { SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api-client";
import { streamChat } from "@/lib/streaming";
import type { Message } from "@/types/api";

type LocalMessage = Message | { id: string; role: "user" | "assistant"; content: string; status: string };

export function ChatWindow({ conversationId }: { conversationId?: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoadError("");

    if (!conversationId) {
      setMessages([]);
      return;
    }

    api
      .getConversation(conversationId)
      .then((conversation) => {
        if (active) setMessages(conversation.messages);
      })
      .catch((error) => {
        if (!active) return;
        setMessages([]);
        setLoadError(error instanceof Error ? error.message : "Unable to load this conversation.");
      });

    return () => {
      active = false;
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const localUserId = crypto.randomUUID();
    const localAssistantId = crypto.randomUUID();
    setInput("");
    setLoading(true);
    setMessages((current) => [
      ...current,
      { id: localUserId, role: "user", content: text, status: "complete" },
      { id: localAssistantId, role: "assistant", content: "", status: "streaming" }
    ]);

    let startedConversationId: string | undefined;
    let assistantMessageId = localAssistantId;

    try {
      await streamChat(
        { conversationId, message: text },
        {
          onStart: (data) => {
            startedConversationId = data.conversationId;
            assistantMessageId = data.assistantMessageId;
            setMessages((current) =>
              current.map((message) => {
                if (message.id === localUserId) return { ...message, id: data.userMessageId };
                if (message.id === localAssistantId) return { ...message, id: data.assistantMessageId };
                return message;
              })
            );
          },
          onToken: (token) => {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, content: `${message.content}${token}` }
                  : message
              )
            );
          },
          onEnd: () => {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessageId ? { ...message, status: "complete" } : message
              )
            );
            if (!conversationId && startedConversationId) {
              router.replace(`/chat/${startedConversationId}`);
            }
          },
          onError: (message) => {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId
                  ? { ...item, content: item.content || message, status: "failed" }
                  : item
              )
            );
          }
        }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          {messages.length === 0 ? (
            <div className="grid min-h-[55vh] place-items-center text-center">
              <div>
                <h1 className="text-2xl font-semibold text-ink">
                  {loadError ? "Conversation unavailable" : "Start a new chat"}
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  {loadError || "Ask anything and Valenix will stream a response."}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-ink text-white"
                      : "border border-line bg-white text-gray-800"
                  }`}
                >
                  {message.content || " "}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-line bg-white p-4">
        <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Message Valenix"
            className="max-h-40 min-h-12 flex-1 resize-none rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-ink"
            rows={1}
          />
          <button
            className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-ink text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !input.trim()}
            title="Send message"
            type="submit"
          >
            <SendHorizontal size={19} />
          </button>
        </form>
      </div>
    </div>
  );
}
