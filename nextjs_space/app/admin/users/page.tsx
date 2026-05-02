export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import UsersClient from "@/components/admin/users-client";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if ((session.user as any)?.role !== "ADMIN") redirect("/admin");
  console.log("TYTY");

  return <UsersClient currentUserId={(session.user as any)?.id ?? ""} />;
}
