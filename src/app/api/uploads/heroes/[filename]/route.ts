import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const HEROES_DIR = path.join(process.cwd(), "public", "uploads", "heroes");

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;

  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!filename.match(/\.(png|jpg|jpeg|webp)$/i)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const filepath = path.join(HEROES_DIR, filename);

  try {
    const buffer = await fs.readFile(filepath);

    const ext = filename.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
