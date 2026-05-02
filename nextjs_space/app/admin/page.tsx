export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardClient from "@/components/admin/dashboard-client";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const [totalPosts, publishedPosts, draftPosts, totalCategories, totalTags, totalAuthors, totalMedia, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.user.count(),
    prisma.media.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { author: { select: { name: true } }, category: { select: { name: true } } },
    }),
  ]);

  const data = {
    totalPosts, publishedPosts, draftPosts, totalCategories, totalTags, totalAuthors, totalMedia,
    recentPosts: recentPosts.map((p: any) => ({
      id: p.id, title: p.title, status: p.status,
      authorName: p.author?.name ?? "",
      categoryName: p.category?.name ?? "",
      updatedAt: p.updatedAt?.toISOString?.() ?? "",
    })),
  };

  return <DashboardClient data={data} />;
}
