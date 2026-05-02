export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const categorySlug = searchParams.get("category") ?? "";

    const where: any = { status: "PUBLISHED" };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { name: true, avatar: true } },
        category: { select: { name: true, slug: true } },
        coverImage: { select: { url: true } },
      },
    });

    const serialized = (posts ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImageUrl: p.coverImage?.url ?? null,
      authorName: p.author?.name ?? "",
      authorAvatar: p.author?.avatar ?? null,
      categoryName: p.category?.name ?? null,
      categorySlug: p.category?.slug ?? null,
      publishedAt: p.publishedAt?.toISOString?.() ?? "",
    }));

    return NextResponse.json(serialized);
  } catch (err: any) {
    console.error("Public posts error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
