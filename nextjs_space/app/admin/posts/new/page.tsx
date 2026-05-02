export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PostForm from "@/components/admin/post-form";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const [categories, authors, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <PostForm mode="create" categories={categories} authors={authors} currentUserId={(session.user as any)?.id ?? ""} allTags={tags} />;
}
