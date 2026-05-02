export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import TagsClient from "@/components/admin/tags-client";

export default async function TagsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  const serialized = tags.map((t: any) => ({
    id: t.id, name: t.name, slug: t.slug,
    postCount: t._count?.posts ?? 0,
    createdAt: t.createdAt?.toISOString?.() ?? "",
  }));

  return <TagsClient tags={serialized} />;
}
