import { openai } from "./openai.service";

export type RetrievedChunk = {
  text: string;
  filename: string;
  score?: number;
};

export async function retrieveRelevantChunks(
  question: string,
  maxResults: number,
): Promise<RetrievedChunk[]> {
  const { data } = await openai.vectorStores.list();
  const vectorStoreIds = data.map(({ id }) => id);

  const chunks: RetrievedChunk[] = [];

  for (const vectorStoreId of vectorStoreIds) {
    for await (const result of openai.vectorStores.search(vectorStoreId, {
      query: question,
      max_num_results: maxResults,
    })) {
      const textContent = result.content
        ?.filter((c): c is { type: "text"; text: string } => c.type === "text")
        .map((c) => c.text)
        .join("\n");

      if (textContent) {
        chunks.push({
          text: textContent,
          filename: result.filename ?? "unknown",
          score: result.score,
        });
      }
    }
  }

  return chunks
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, maxResults);
}
