import path from "node:path";

const ALLOWED_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".json",
  ".csv",
  ".pdf",
  ".docx",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateExtension(filename) {
  const extension = path.extname(String(filename || "")).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw Object.assign(
      new Error(
        `Unsupported file type. Allowed: ${[
          ...ALLOWED_EXTENSIONS,
        ].join(", ")}`
      ),
      { status: 400 }
    );
  }

  return extension;
}

export function validateFileSize(size) {
  if (!Number.isFinite(size) || size < 0) {
    throw Object.assign(new Error("Invalid file size."), { status: 400 });
  }

  if (size > MAX_FILE_SIZE) {
    throw Object.assign(new Error("File exceeds the 10 MB limit."), {
      status: 413,
    });
  }

  return true;
}

export function safeFilename(filename) {
  const base = path.basename(String(filename || ""));
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, "_");

  if (!clean || clean === "." || clean === "..") {
    throw Object.assign(new Error("Invalid filename."), { status: 400 });
  }

  return clean;
}
