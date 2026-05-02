import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/admin-layout-client";
import { getSiteConfig } from "@/lib/site-config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();
  const session = await getServerSession(authOptions);
  // Login page doesn't need the admin shell
  return (
    <AdminLayoutClient
      settings={{
        siteName: config.siteName,
        logoText: config.logoText,
        siteTagline: config.siteTagline,
      }}
      session={session}
    >
      {children}
    </AdminLayoutClient>
  );
}
