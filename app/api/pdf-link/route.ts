import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// POST: Upload a PDF and get a shareable link
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return Response.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // 20MB limit
    if (file.size > 20 * 1024 * 1024) {
      return Response.json({ error: "File too large (max 20MB)" }, { status: 400 });
    }

    await ensureDir();

    // Generate unique ID
    const id = crypto.randomBytes(6).toString("hex"); // 12 char hex ID
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedName = `${id}_${safeFileName}`;

    // Save the file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(UPLOAD_DIR, storedName);
    await fs.writeFile(filePath, buffer);

    // Save metadata
    const meta = {
      id,
      originalName: file.name,
      storedName,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    await fs.writeFile(
      path.join(UPLOAD_DIR, `${id}.json`),
      JSON.stringify(meta, null, 2)
    );

    const origin = request.nextUrl.origin;
    const viewUrl = `${origin}/view/${id}`;

    return Response.json({
      success: true,
      id,
      url: viewUrl,
      fileName: file.name,
      size: file.size,
    });
  } catch (e: any) {
    console.error("Upload error:", e);
    return Response.json(
      { error: "Upload failed: " + e.message },
      { status: 500 }
    );
  }
}

// GET: List recent uploads (optional, for admin)
export async function GET() {
  try {
    await ensureDir();
    const files = await fs.readdir(UPLOAD_DIR);
    const metaFiles = files.filter((f) => f.endsWith(".json"));
    const metas = await Promise.all(
      metaFiles.map(async (f) => {
        const data = await fs.readFile(path.join(UPLOAD_DIR, f), "utf-8");
        return JSON.parse(data);
      })
    );
    metas.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    return Response.json({ files: metas.slice(0, 50) });
  } catch {
    return Response.json({ files: [] });
  }
}
