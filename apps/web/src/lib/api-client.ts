import { API_BASE_URL } from "@/lib/config";
import type { ConversationDetail, ConversationSummary, User } from "@/types/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || `Request failed with ${response.status}`;

    try {
      const body = JSON.parse(text) as { detail?: unknown; message?: unknown };
      if (typeof body.detail === "string") message = body.detail;
      if (typeof body.message === "string") message = body.message;
    } catch {
      // Keep the raw response text when the backend does not return JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export const api = {
  signup: (payload: { email: string; password: string; name?: string }) =>
    request<User>("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<User>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request<User>("/auth/me"),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  listConversations: async () => {
    const response = await request<{ items: ConversationSummary[]; nextCursor: string | null }>(
      "/conversations"
    );
    return response.items;
  },
  createConversation: () =>
    request<ConversationSummary>("/conversations", {
      method: "POST",
      body: JSON.stringify({ title: "New chat" })
    }),
  getConversation: (id: string) => request<ConversationDetail>(`/conversations/${id}`)
};
