import { RetrievedChunk } from "./rag.service";

export function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map(
      (c) => `
SOURCE FILE: ${c.filename}

CONTENT:
${c.text}
`,
    )
    .join("\n\n====================\n\n");
}
