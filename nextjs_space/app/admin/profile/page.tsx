export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import ProfileClient from "@/components/admin/profile-client";

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const userId = (session.user as any)?.id;

  if (!userId) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      bio: true,
      avatar: true,
      role: true,
      active: true,
    },
  });

  if (!user) {
    redirect("/admin/login");
  }

  return <ProfileClient user={user} />;
}
