export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PostForm from "@/components/admin/post-form";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const [post, categories, authors, tags] = await Promise.all([
    prisma.post.findUnique({
      where: { id: params.id },
      include: {
        coverImage: { select: { id: true, url: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) return notFound();

  const serialized = {
    ...post,
    tags: (post.tags ?? []).map((pt: any) => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug })),
    createdAt: post.createdAt?.toISOString?.(),
    updatedAt: post.updatedAt?.toISOString?.(),
    publishedAt: post.publishedAt?.toISOString?.() ?? null,
    coverImage: post.coverImage ? { ...post.coverImage } : null,
  };

  return <PostForm mode="edit" post={serialized} categories={categories} authors={authors} currentUserId={(session.user as any)?.id ?? ""} allTags={tags} />;
}
