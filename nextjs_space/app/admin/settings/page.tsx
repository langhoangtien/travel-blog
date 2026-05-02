export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { getSiteConfig } from "@/lib/site-config";
import SiteSettingsForm from "@/components/admin/site-settings-form";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const config = await getSiteConfig();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <SiteSettingsForm initialData={config} />
    </div>
  );
}
