import express from "express";

const app = express();
const PORT = process.env.PORT ?? 3000;

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
*/
app.post("/ask", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
