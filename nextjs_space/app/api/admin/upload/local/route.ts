export const dynamic = "force-dynamic";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { getSiteConfig } from "@/lib/site-config";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((process.env.UPLOAD || "LOCAL") === "S3") {
      return NextResponse.json(
        { error: "Local upload is disabled in S3 mode" },
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mediaId = formData.get("mediaId")?.toString();

    if (!file || !mediaId) {
      return NextResponse.json(
        { error: "Missing file or mediaId" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Max file size is 5MB" },
        { status: 400 },
      );
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const config = await getSiteConfig();

    const enableOptimization = config.enableImageOptimization ?? true;
    const imageFormat = (config.imageFormat || "webp").toLowerCase();

    let maxWidth = config.contentImageMaxWidth || 1600;
    let quality = config.contentImageQuality || 80;

    if (media.type === "COVER") {
      maxWidth = config.coverImageMaxWidth || 1920;
      quality = config.coverImageQuality || 82;
    } else if (media.type === "AVATAR") {
      maxWidth = config.avatarImageMaxWidth || 400;
      quality = config.avatarImageQuality || 80;
    }
    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const originalBaseName =
      media.filename.replace(/\.[^.]+$/, "") ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    let outputBuffer: Buffer;
    let finalFilename: string;
    let finalMimeType: string;
    let finalFormat: string;
    let outputWidth: number | undefined;
    let originalWidth: number | null = null;
    let originalHeight: number | null = null;

    if (enableOptimization) {
      const image = sharp(inputBuffer, { failOn: "none" });
      const metadata = await image.metadata();

      originalWidth = metadata.width ?? null;
      originalHeight = metadata.height ?? null;
      outputWidth = metadata.width
        ? Math.min(metadata.width, maxWidth)
        : undefined;

      const resized = image.resize({
        width: maxWidth,
        withoutEnlargement: true,
      });

      if (imageFormat === "jpeg" || imageFormat === "jpg") {
        outputBuffer = await resized.jpeg({ quality }).toBuffer();
        finalFilename = `${originalBaseName}.jpg`;
        finalMimeType = "image/jpeg";
        finalFormat = "jpeg";
      } else if (imageFormat === "png") {
        outputBuffer = await resized.png().toBuffer();
        finalFilename = `${originalBaseName}.png`;
        finalMimeType = "image/png";
        finalFormat = "png";
      } else {
        outputBuffer = await resized.webp({ quality }).toBuffer();
        finalFilename = `${originalBaseName}.webp`;
        finalMimeType = "image/webp";
        finalFormat = "webp";
      }
    } else {
      outputBuffer = inputBuffer;

      const ext =
        file.name.split(".").pop()?.toLowerCase() ||
        media.filename.split(".").pop()?.toLowerCase() ||
        "jpg";

      finalFilename = `${originalBaseName}.${ext}`;
      finalMimeType = file.type;
      finalFormat = ext;
    }

    const filePath = path.join(uploadDir, finalFilename);
    await fs.writeFile(filePath, outputBuffer);

    const publicUrl = `/uploads/${finalFilename}`;

    const updated = await prisma.media.update({
      where: { id: mediaId },
      data: {
        filename: finalFilename,
        cloud_storage_path: publicUrl,
        url: publicUrl,
        mimeType: finalMimeType,
        size: outputBuffer.length,
        isPublic: true,
      },
    });

    return NextResponse.json({
      success: true,
      mediaId: updated.id,
      url: updated.url,
      cloud_storage_path: updated.cloud_storage_path,
      width: outputWidth,
      originalWidth,
      originalHeight,
      optimized: enableOptimization,
      format: finalFormat,
    });
  } catch (error) {
    console.error("Local upload error:", error);
    return NextResponse.json({ error: "Local upload failed" }, { status: 500 });
  }
}
