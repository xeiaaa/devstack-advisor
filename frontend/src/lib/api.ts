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
