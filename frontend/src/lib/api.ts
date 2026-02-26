const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type AskResponse = {
  status: "ok";
  answer: string;
  vectorStoreIds: string[];
};

export type AskErrorResponse = {
  error: string;
};

export async function askQuestion(
  question: string
): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question.trim() }),
  });

  const data = (await res.json()) as AskResponse | AskErrorResponse;

  if (!res.ok) {
    const message =
      "error" in data ? data.error : "Failed to generate response";
    throw new Error(message);
  }

  return data as AskResponse;
}

export async function askQuestionStream(
  question: string,
  onDelta: (delta: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question.trim() }),
    signal,
  });

  if (!res.ok) {
    const data = (await res.json()) as AskErrorResponse;
    const message =
      "error" in data ? data.error : "Failed to generate response";
    throw new Error(message);
  }

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const dataLine = event.split("\n").find((line) => line.startsWith("data: "));
      if (!dataLine) continue;
      try {
        const data = JSON.parse(dataLine.slice(6));
        if (data.error) throw new Error(data.error);
        if (data.delta) onDelta(data.delta);
      } catch (err) {
        if (err instanceof Error) throw err;
      }
    }
  }
}
