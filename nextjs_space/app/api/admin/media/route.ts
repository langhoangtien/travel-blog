export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const search = url.searchParams.get("search") ?? "";
    const type = url.searchParams.get("type") ?? "";
    const orphan = url.searchParams.get("orphan") === "true";
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "40");

    const where: any = {};
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type === "COVER" || type === "CONTENT") where.type = type;
    if (orphan) {
      where.postId = null;
      where.coverForPost = null;
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          post: { select: { id: true, title: true, slug: true } },
          coverForPost: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      media: (media ?? []).map((m: any) => ({
        id: m.id,
        url: m.url,
        filename: m.filename,
        mimeType: m.mimeType,
        size: m.size,
        type: m.type,
        altText: m.altText,
        createdAt: m.createdAt?.toISOString?.() ?? "",
        usedIn: m.post ? { id: m.post.id, title: m.post.title, slug: m.post.slug, relation: "content" } :
                m.coverForPost ? { id: m.coverForPost.id, title: m.coverForPost.title, slug: m.coverForPost.slug, relation: "cover" } :
                null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("Media fetch error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
