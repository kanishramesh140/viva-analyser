import fs from "node:fs/promises";
import path from "node:path";
import { validateExtension, validateFileSize } from "../utils/fileValidation.js";

export async function processTextDocument(filePath) {
  const stat = await fs.stat(filePath);

  validateFileSize(stat.size);

  const extension = validateExtension(filePath);

  if (![".txt", ".md", ".json", ".csv"].includes(extension)) {
    throw Object.assign(
      new Error(
        `Text extraction for ${extension} is not enabled yet. Install a document parser for PDF/DOCX support.`
      ),
      { status: 415 }
    );
  }

  const text = await fs.readFile(filePath, "utf8");

  return {
    filename: path.basename(filePath),
    extension,
    characters: text.length,
    text,
    processedAt: new Date().toISOString(),
  };
}
