export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CategoriesClient from "@/components/admin/categories-client";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  const serialized = categories.map((c: any) => ({
    id: c.id, name: c.name, slug: c.slug, description: c.description,
    postCount: c._count?.posts ?? 0,
    createdAt: c.createdAt?.toISOString?.() ?? "",
  }));

  return <CategoriesClient categories={serialized} />;
}
