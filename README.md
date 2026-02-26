# DevStack Advisor

## Environment

- **Node version:** v25.2.1

## Setup

Create `.env` files by copying `.env.sample` from each package folder:

```bash
cp backend/.env.sample backend/.env
cp frontend/.env.sample frontend/.env
```

## Run

```bash
npm install
npm run dev
```

## Architecture

### Frontend

- React / TypeScript / Vite / Tailwind / shadcn
- React Query

### Backend

- Express
- OpenAI Node SDK

## Key Technical Decision

The OpenAI Responses API `file_search` tool limits how many vector stores can be used in a single call. Passing more than 2 `vector_store_ids` throws an error.

Proposed solutions:

1. **X** — Move all files to fewer than 2 vector stores. Issue: not scalable for production where each user typically has a separate vector store.
2. **X** — Multiple `openai.responses.create` requests per vector store id. Issue: inefficient and increases LLM cost.
3. **✓** — Use **Search vector store**
   - Get relevant chunks based on a query
   - Synthesize the chunks to create the output (+ the prompt)

## Known Bugs

- When the response is still "thinking" and you refresh the page, you will not get the chunks. If you refresh after the backend has finished streaming all chunks, you will be able to retrieve the full answer.
- Auto-scroll UX: when user scrolls up while receiving chunks, stop auto-scrolling (similar to ChatGPT)

## TODO and Refactors (Time Constraints)

- Source attribution: source file should be included if possible on the response
- OpenAI client creation should be a singleton
- Separate service and controller files for `/ask` and `/history` (e.g. `POST /api/openai/ask`, `GET /api/openai/history` with `openai.controllers.ts` and `openai.service.ts`)
- Move types to their own files (e.g. `HistoryEntry`)
- Replace in-memory history with file-based persistence
