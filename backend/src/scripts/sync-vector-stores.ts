import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

dotenv.config();

const VECTOR_STORE_DATA_DIR = path.join(__dirname, "../../vector-store-data");

const MIME_TYPES: Record<string, string> = {
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".json": "application/json",
  ".html": "text/html",
  ".csv": "text/csv",
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] ?? "text/plain";
}

function getFilesInDir(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile() && !entry.name.startsWith(".")) {
      files.push(fullPath);
    } else if (entry.isDirectory()) {
      files.push(...getFilesInDir(fullPath));
    }
  }
  return files;
}

async function uploadFile(
  client: OpenAI,
  filePath: string,
): Promise<{ fileId: string; filename: string }> {
  const filename = path.basename(filePath);
  const bytes = fs.statSync(filePath).size;
  const mimeType = getMimeType(filePath);

  const upload = await client.uploads.create({
    bytes,
    filename,
    mime_type: mimeType,
    purpose: "assistants",
  });

  const part = await client.uploads.parts.create(upload.id, {
    data: fs.createReadStream(filePath),
  });

  const completed = await client.uploads.complete(upload.id, {
    part_ids: [part.id],
  });

  if (!completed.file?.id) {
    throw new Error(`Upload failed for ${filePath}: no file id returned`);
  }

  return { fileId: completed.file.id, filename };
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  if (!fs.existsSync(VECTOR_STORE_DATA_DIR)) {
    throw new Error(
      `Vector store data directory not found: ${VECTOR_STORE_DATA_DIR}`,
    );
  }

  const client = new OpenAI({ apiKey });

  const entries = fs.readdirSync(VECTOR_STORE_DATA_DIR, {
    withFileTypes: true,
  });
  const folders = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith("."),
  );

  for (const folder of folders) {
    const folderPath = path.join(VECTOR_STORE_DATA_DIR, folder.name);
    const files = getFilesInDir(folderPath);

    if (files.length === 0) {
      console.log(`[${folder.name}] No files found, skipping`);
      continue;
    }

    console.log(`[${folder.name}] Creating vector store...`);
    const vectorStore = await client.vectorStores.create({
      name: folder.name,
    });
    console.log(`[${folder.name}] Vector store created: ${vectorStore.id}`);

    console.log(`[${folder.name}] Uploading ${files.length} file(s)...`);
    const uploadResults = await Promise.all(
      files.map((filePath) => uploadFile(client, filePath)),
    );

    const fileIdMap = new Map<string, string>();
    for (const { fileId, filename } of uploadResults) {
      fileIdMap.set(filename, fileId);
    }
    console.log(`[${folder.name}] File IDs:`, Object.fromEntries(fileIdMap));

    const fileIds = uploadResults.map((r) => r.fileId);
    console.log(`[${folder.name}] Attaching files to vector store...`);

    const batch = await client.vectorStores.fileBatches.createAndPoll(
      vectorStore.id,
      {
        file_ids: fileIds,
      },
    );
    console.log(
      `[${folder.name}] File batch completed: ${batch.id} (status: ${batch.status})`,
    );
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
