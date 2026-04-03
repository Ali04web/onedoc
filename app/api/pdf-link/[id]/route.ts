import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const metaPath = path.join(UPLOAD_DIR, `${id}.json`);
    const metaRaw = await fs.readFile(metaPath, "utf-8");
    const meta = JSON.parse(metaRaw);

    return Response.json(meta);
  } catch {
    return Response.json({ error: "File not found" }, { status: 404 });
  }
}

// DELETE: Remove an uploaded PDF
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const metaPath = path.join(UPLOAD_DIR, `${id}.json`);
    const metaRaw = await fs.readFile(metaPath, "utf-8");
    const meta = JSON.parse(metaRaw);

    // Delete PDF file
    await fs.unlink(path.join(UPLOAD_DIR, meta.storedName)).catch(() => {});
    // Delete metadata
    await fs.unlink(metaPath).catch(() => {});

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "File not found" }, { status: 404 });
  }
}
