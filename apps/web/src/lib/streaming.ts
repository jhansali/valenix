import { API_BASE_URL } from "@/lib/config";

type StreamCallbacks = {
  onStart: (data: { conversationId: string; userMessageId: string; assistantMessageId: string }) => void;
  onToken: (text: string) => void;
  onEnd: () => void;
  onError: (message: string) => void;
};

function isMessageStartData(
  data: Record<string, unknown>
): data is { conversationId: string; userMessageId: string; assistantMessageId: string } {
  return (
    typeof data.conversationId === "string" &&
    typeof data.userMessageId === "string" &&
    typeof data.assistantMessageId === "string"
  );
}

export async function streamChat(
  payload: { conversationId?: string; message: string },
  callbacks: StreamCallbacks
) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversationId: payload.conversationId,
        message: payload.message
      })
    });
  } catch {
    callbacks.onError("Unable to connect to the chat service.");
    return;
  }

  if (!response.ok || !response.body) {
    callbacks.onError(await response.text() || "Unable to start chat response.");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = done ? "" : events.pop() || "";

    for (const rawEvent of events) {
      if (!rawEvent.trim()) continue;

      const lines = rawEvent.split("\n");
      const eventLine = lines.find((line) => line.startsWith("event: "));
      const dataLines = lines.filter((line) => line.startsWith("data: "));
      if (!eventLine || dataLines.length === 0) continue;

      const event = eventLine.replace("event: ", "").trim();
      const dataText = dataLines.map((line) => line.replace("data: ", "")).join("\n");

      let data: Record<string, unknown>;
      try {
        data = JSON.parse(dataText);
      } catch {
        callbacks.onError("Received an invalid chat stream event.");
        return;
      }

      if (event === "message_start") {
        if (!isMessageStartData(data)) {
          callbacks.onError("Received an invalid chat start event.");
          return;
        }
        callbacks.onStart(data);
      }
      const text = (data as Record<string, unknown>).text;
      if (event === "token" && typeof text === "string") callbacks.onToken(text);
      if (event === "message_end") callbacks.onEnd();
      if (event === "error") {
        const message = (data as Record<string, unknown>).message;
        callbacks.onError(typeof message === "string" ? message : "Generation failed.");
      }
    }

    if (done) break;
  }
}
