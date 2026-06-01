export type User = {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  status: "waitlisted" | "active" | "suspended" | string;
  emailVerified: boolean;
};

export type ConversationSummary = {
  id: string;
  title: string;
  model: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  status: string;
  createdAt: string;
};

export type ConversationDetail = ConversationSummary & {
  messages: Message[];
};
