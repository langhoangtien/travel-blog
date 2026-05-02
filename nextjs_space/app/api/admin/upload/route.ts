export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { generatePresignedUploadUrl, getFileUrl } from "@/lib/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mode = process.env.UPLOAD || "LOCAL";

    const body = await req.json();

    const { fileName, contentType, fileSize, type, postId } = body;

    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (fileSize > MAX_SIZE) {
      return NextResponse.json({ error: "Max 5MB" }, { status: 400 });
    }

    const ext = fileName.split(".").pop() || "jpg";
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    // ===== S3 MODE =====
    if (mode === "S3") {
      const { uploadUrl, cloud_storage_path } =
        await generatePresignedUploadUrl(uniqueName, contentType, true);

      const url = await getFileUrl(cloud_storage_path, true);

      const media = await prisma.media.create({
        data: {
          filename: uniqueName,
          cloud_storage_path,
          url,
          mimeType: contentType,
          size: fileSize,
          type: type === "COVER" ? "COVER" : "CONTENT",
          isPublic: true,
          postId: postId ?? null,
        },
      });

      return NextResponse.json({
        mode: "S3",
        uploadUrl,
        url,
        mediaId: media.id,
      });
    }

    // ===== LOCAL MODE =====
    const localPath = `/uploads/${uniqueName}`;

    const media = await prisma.media.create({
      data: {
        filename: uniqueName,
        cloud_storage_path: localPath,
        url: localPath,
        mimeType: contentType,
        size: fileSize,
        type: type === "COVER" ? "COVER" : "CONTENT",
        isPublic: true,
        postId: postId ?? null,
      },
    });

    return NextResponse.json({
      mode: "LOCAL",
      uploadUrl: null,
      url: localPath,
      mediaId: media.id,
      fileName: uniqueName,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
