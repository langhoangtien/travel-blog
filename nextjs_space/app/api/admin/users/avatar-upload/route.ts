export const dynamic = "force-dynamic";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const input = new Uint8Array(bytes);

    const optimized = await sharp(input)
      .resize({ width: 400, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const filename = `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const dir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(dir, { recursive: true });

    const output = new Uint8Array(optimized);
    await fs.writeFile(path.join(dir, filename), output);

    return NextResponse.json({
      url: `/uploads/avatars/${filename}`,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
