import { processTextDocument } from "../ai/documentProcessor.js";

export async function process(req, res, next) {
  try {
    const filePath = req.body?.filePath;

    if (!filePath) {
      throw Object.assign(new Error("File path is required."), {
        status: 400,
      });
    }

    const result = await processTextDocument(filePath);

    res.json({
      ok: true,
      document: result,
    });
  } catch (error) {
    next(error);
  }
}
