export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      include: {
        author: { select: { name: true, avatar: true, bio: true } },
        category: { select: { name: true, slug: true } },
        coverImage: { select: { url: true } },
      },
    });
    if (!post || post.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...post,
      coverImageUrl: post.coverImage?.url ?? null,
      createdAt: post.createdAt?.toISOString?.() ?? "",
      updatedAt: post.updatedAt?.toISOString?.() ?? "",
      publishedAt: post.publishedAt?.toISOString?.() ?? "",
    });
  } catch (err: any) {
    console.error("Post detail error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
