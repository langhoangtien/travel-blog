export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import MediaLibraryClient from "@/components/admin/media-library-client";

export default async function MediaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  return <MediaLibraryClient />;
}
