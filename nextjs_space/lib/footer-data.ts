import { prisma } from "@/lib/db";

export async function getFooterData() {
  const [categories, recentPosts] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: { title: true, slug: true },
    }),
  ]);

  return {
    categories: (categories ?? []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
    recentPosts: (recentPosts ?? []).map((p: any) => ({ title: p.title, slug: p.slug })),
  };
}
