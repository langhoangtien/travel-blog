export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PostsListClient from "@/components/admin/posts-list-client";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 15;
  const search = searchParams.search ?? "";
  const status = searchParams.status ?? "";
  const categoryId = searchParams.categoryId ?? "";
  const tagId = searchParams.tagId ?? "";
  const authorId = searchParams.authorId ?? "";
  const sortBy = searchParams.sortBy ?? "createdAt";
  const sortOrder = searchParams.sortOrder === "asc" ? "asc" : "desc";

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
  const orderBy = allowedSorts.includes(sortBy)
    ? { [sortBy]: sortOrder }
    : { createdAt: "desc" as const };

  const [total, posts, categories, tags, authors] = await Promise.all([
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
        tags: { include: { tag: { select: { id: true, name: true } } } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const serialized = posts.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    authorName: p.author?.name ?? "",
    categoryName: p.category?.name ?? "",
    tags: (p.tags ?? []).map((pt: any) => pt.tag?.name ?? ""),
    createdAt: p.createdAt?.toISOString?.() ?? "",
    updatedAt: p.updatedAt?.toISOString?.() ?? "",
  }));

  return (
    <PostsListClient
      posts={serialized}
      total={total}
      page={page}
      limit={limit}
      totalPages={Math.ceil(total / limit)}
      categories={categories}
      tags={tags}
      authors={authors}
      filters={{
        search,
        status,
        categoryId,
        tagId,
        authorId,
        sortBy,
        sortOrder,
      }}
    />
  );
}
