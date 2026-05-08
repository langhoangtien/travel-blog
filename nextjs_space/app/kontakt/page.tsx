export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { getSiteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";
import ContactForm from "@/components/public/contact-form";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kontakt – Reiseblog",
  description:
    "Kontaktieren Sie uns — wir freuen uns auf Ihre Nachricht, Fragen oder Anregungen rund ums Reisen.",
};

export default async function ContactPage() {
  const config = await getSiteConfig();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const recentPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: { title: true, slug: true },
  });

  const contactEmail = config.contactEmail || "kontakt@nerovia.de";
  const locationText =
    config.locationText || "Weltweit unterwegs — digitale Redaktion";

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader
        settings={{
          siteName: config.siteName,
          siteTagline: config.siteTagline,
          logoText: config.logoText,
          showSearch: config.showSearch,
          showCategoriesInHeader: config.showCategoriesInHeader,
        }}
      />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6">
              <MessageSquare className="w-4 h-4" /> Schreiben Sie uns
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
              Kontakt
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Haben Sie Fragen, Anregungen oder möchten Sie mit uns
              zusammenarbeiten? Wir freuen uns auf Ihre Nachricht.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-display font-bold mb-4">
                  Kontaktinformationen
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Füllen Sie einfach das Formular aus und wir melden uns
                  schnellstmöglich bei Ihnen.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">E-Mail</h3>
                    <p className="text-sm text-muted-foreground">
                      {contactEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">Standort</h3>
                    <p className="text-sm text-muted-foreground">
                      {locationText}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl shadow-sm border border-border/30 p-6 sm:p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter
        categories={categories as any}
        recentPosts={recentPosts as any}
        settings={{
          siteName: config.siteName,
          logoText: config.logoText,
          footerDescription: config.footerDescription,
          locationText: config.locationText,
          footerCopyright: config.footerCopyright,
          facebookUrl: config.facebookUrl,
          instagramUrl: config.instagramUrl,
          youtubeUrl: config.youtubeUrl,
          tiktokUrl: config.tiktokUrl,
          showFooterCategories: config.showFooterCategories,
          showFooterRecentPosts: config.showFooterRecentPosts,
        }}
      />
    </div>
  );
}
