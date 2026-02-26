import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";
import cors from "cors";

dotenv.config();

const app = express();

// TODO: move this to another file
const apiKey = process.env.OPENAI_API_KEY!;
const openai = new OpenAI({ apiKey });

const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Hello from Express + TypeScript" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/*
  requestBody {
    question: string
    model?: string
    temperature?: number
    maxResults?: number
  }

  Have default values for the model (gpt-4o mini), temperature and maxResults

  - for the Key Constraint, i think we can do 2 solutions
    1.  We can have multiple `openai.responses.create` requests for each vector store id, and maybe do something about the response
        - Note: i think this is not efficient, and would cost more since there is LLM involved
    2. Use `Search vector store` 
        - Get relevant chunks based on a query
        - Synthesize the chunks to create the output (+ the prompt)

    We'll do Option 2
*/

// TODO: Update this prompt
const SYNTHESIS_INSTRUCTIONS = `- Synthesise information from all available knowledge sources
- Provide specific, actionable recommendations rather than generic advice
- Reference relevant case studies and real-world outcomes where applicable
- Acknowledge trade-offs and limitations of recommended approaches`;

type HistoryEntry = {
  id: string;
  question: string;
  response: string;
  settings: { model: string; temperature: number; maxResults: number };
  createdAt: string;
  completedAt: string | undefined;
};

const history: HistoryEntry[] = [];

app.get("/history", (_req, res) => {
  res.json(history);
});

app.post("/ask", async (req, res) => {
  const {
    question,
    model = "gpt-4o-mini-2024-07-18",
    temperature = 0.7,
    maxResults = 20,
  } = req.body ?? {};

  // We'll do validation for here for now, instead of a middleware
  if (!question || typeof question !== "string" || question.trim() === "") {
    res
      .status(400)
      .json({ error: "question is required and must be a non-empty string" });
    return;
  }

  const id = `${Date.now()}`;
  const settings = { model, temperature, maxResults };
  const entry: HistoryEntry = {
    id,
    question,
    response: "",
    settings,
    createdAt: new Date().toISOString(),
    completedAt: undefined,
  };
  history.push(entry);

  const { data } = await openai.vectorStores.list();
  const vectorStoreIds = data.map(({ id }) => id);

  const chunks: Array<{ text: string; filename: string; score?: number }> = [];
  const maxPerStore = Math.max(
    5,
    Math.ceil(maxResults / vectorStoreIds.length),
  );

  for (const vectorStoreId of vectorStoreIds) {
    for await (const result of openai.vectorStores.search(vectorStoreId, {
      query: question,
      max_num_results: Math.min(50, maxPerStore),
    })) {
      const textContent = result.content
        ?.filter((c): c is { type: "text"; text: string } => c.type === "text")
        .map((c) => c.text)
        .join("\n");
      if (textContent) {
        chunks.push({
          text: textContent,
          filename: result.filename ?? "unknown",
          score: result.score ?? undefined,
        });
      }
    }
  }

  const context = chunks
    .map((c) => `[Source: ${c.filename}]\n${c.text}`)
    .join("\n\n---\n\n");

  try {
    const stream = await openai.responses.create({
      model,
      temperature,
      instructions: SYNTHESIS_INSTRUCTIONS,
      input: context
        ? `Context from knowledge base:\n\n${context}\n\nUser question: ${question}`
        : question,
      stream: true,
    });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    let fullResponse = "";
    for await (const event of stream) {
      if (event.type === "response.output_text.delta" && event.delta) {
        fullResponse += event.delta;
        res.write(`data: ${JSON.stringify({ delta: event.delta })}\n\n`);
      }
    }
    entry.response = fullResponse;
    entry.completedAt = new Date().toISOString();
    res.write("event: done\ndata: {}\n\n");
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate response" });
    } else {
      res.write(
        `event: error\ndata: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`,
      );
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
