export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/s3";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { altText } = await req.json();
    const media = await prisma.media.update({
      where: { id: params.id },
      data: { altText: altText ?? null },
    });
    return NextResponse.json(media);
  } catch (err: any) {
    console.error("Media update error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const media = await prisma.media.findUnique({
      where: { id: params.id },
      include: { coverForPost: { select: { id: true } } },
    });
    if (!media) return NextResponse.json({ error: "Kh\u00F4ng t\u00ECm th\u1EA5y" }, { status: 404 });

    // If used as cover image, unlink first
    if (media.coverForPost) {
      await prisma.post.update({
        where: { id: media.coverForPost.id },
        data: { coverImageId: null },
      });
    }

    // Delete from S3
    try { await deleteFile(media.cloud_storage_path); } catch { /* ignore */ }

    // Delete record
    await prisma.media.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Media delete error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
