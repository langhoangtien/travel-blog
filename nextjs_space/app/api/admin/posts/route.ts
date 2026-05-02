export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { extractImageUrlsFromHtml } from "@/lib/media-cleanup";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "15")));
  const search = url.searchParams.get("search") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const categoryId = url.searchParams.get("categoryId") ?? "";
  const tagId = url.searchParams.get("tagId") ?? "";
  const authorId = url.searchParams.get("authorId") ?? "";
  const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status === "DRAFT" || status === "PUBLISHED") where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (authorId) where.authorId = authorId;
  if (tagId) where.tags = { some: { tagId } };

  const allowedSorts = ["createdAt", "updatedAt", "publishedAt", "title"];
  const orderBy = allowedSorts.includes(sortBy) ? { [sortBy]: sortOrder } : { createdAt: "desc" as const };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        coverImage: { select: { url: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    }),
  ]);

  const serialized = posts.map((p: any) => ({
    id: p.id, title: p.title, slug: p.slug, status: p.status, excerpt: p.excerpt,
    authorName: p.author?.name ?? "", authorId: p.authorId,
    categoryName: p.category?.name ?? "", categoryId: p.categoryId,
    coverImageUrl: p.coverImage?.url ?? null,
    tags: (p.tags ?? []).map((pt: any) => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug })),
    createdAt: p.createdAt?.toISOString?.() ?? "",
    updatedAt: p.updatedAt?.toISOString?.() ?? "",
    publishedAt: p.publishedAt?.toISOString?.() ?? "",
  }));

  return NextResponse.json({ posts: serialized, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, excerpt, content, categoryId, authorId, metaTitle, metaDescription, status, coverImageId, tagIds } = body;
  if (!title?.trim()) return NextResponse.json({ error: "Tiêu đề không được để trống." }, { status: 400 });
  if (!slug?.trim()) return NextResponse.json({ error: "Slug không được để trống." }, { status: 400 });

  const slugExists = await prisma.post.findUnique({ where: { slug } });
  if (slugExists) return NextResponse.json({ error: "Slug đã tồn tại." }, { status: 400 });

  const post = await prisma.post.create({
    data: {
      title: title.trim(), slug: slug.trim(), excerpt: excerpt?.trim() || null,
      content: content || null, categoryId: categoryId || null,
      authorId: authorId || (session.user as any)?.id,
      metaTitle: metaTitle?.trim() || null, metaDescription: metaDescription?.trim() || null,
      status: status || "DRAFT",
      coverImageId: coverImageId || null,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      tags: tagIds?.length ? { createMany: { data: tagIds.map((tid: string) => ({ tagId: tid })) } } : undefined,
    },
  });

  // Link orphan media to post
  if (content) {
    const urls = extractImageUrlsFromHtml(content);
    if (urls.length > 0) {
      await prisma.media.updateMany({ where: { url: { in: urls }, postId: null }, data: { postId: post.id } });
    }
  }

  return NextResponse.json(post, { status: 201 });
}
