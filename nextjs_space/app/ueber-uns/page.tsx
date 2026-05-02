import { prisma } from "@/lib/db";
import { getSiteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Heart, Globe2, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Über uns – Reiseblog",
  description:
    "Lernen Sie unser Team kennen und erfahren Sie mehr über unsere Mission, die Welt durch inspirierende Reisegeschichten näher zu bringen.",
  alternates: {
    canonical: "/ueber-uns",
  },
  openGraph: {
    title: "Über uns – Reiseblog",
    description:
      "Lernen Sie unser Team kennen und erfahren Sie mehr über unsere Mission, die Welt durch inspirierende Reisegeschichten näher zu bringen.",
    url: "/ueber-uns",
  },
};

export default async function AboutPage() {
  const config = await getSiteConfig();

  const [authors, categories] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true, bio: true, avatar: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const recentPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: { title: true, slug: true },
  });

  const siteName = config.siteName || "Reiseblog";

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
        <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4" /> Unsere Geschichte
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
              Über <span className="text-primary">{siteName}</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Wir sind ein leidenschaftliches Team von Reisenden, die die Welt
              erkunden und ihre Erfahrungen teilen — damit Sie Ihre nächste
              Reise besser planen können.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border/30 shadow-sm text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Globe2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">
                Unsere Mission
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wir möchten Menschen inspirieren, die Welt zu entdecken. Mit
                authentischen Reiseberichten, praktischen Tipps und persönlichen
                Erfahrungen helfen wir Ihnen, unvergessliche Reisen zu erleben.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border/30 shadow-sm text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">
                Unsere Inhalte
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Von Städtereisen über Strandurlaub bis hin zu kulinarischen
                Abenteuern — wir decken alle Reisethemen ab. Jeder Beitrag wird
                sorgfältig recherchiert und aus erster Hand geschrieben.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border/30 shadow-sm text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">
                Unsere Werte
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Authentizität, Nachhaltigkeit und Respekt vor anderen Kulturen
                stehen bei uns an erster Stelle. Wir fördern
                verantwortungsvolles Reisen und bewusstes Entdecken.
              </p>
            </div>
          </div>
        </section>

        {(authors?.length ?? 0) > 0 && (
          <section className="bg-muted/30 py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-3">
                  Unser Team
                </h2>
                <p className="text-muted-foreground">
                  Die Menschen hinter den Reisegeschichten
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(authors ?? []).map((author: any) => (
                  <Link
                    key={author.id}
                    href={author.slug ? `/autor/${author.slug}` : "#"}
                    className="bg-card rounded-2xl p-6 border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 group text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      {author.avatar ? (
                        <Image
                          src={author.avatar}
                          alt={author.name ?? "Autor"}
                          width={80}
                          height={80}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-primary" />
                      )}
                    </div>

                    <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors">
                      {author.name}
                    </h3>

                    {author.bio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                        {author.bio}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-4">
            Haben Sie Fragen oder Anregungen?
          </h2>

          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Wir freuen uns über Ihr Feedback und beantworten gerne Ihre Fragen
            rund ums Reisen.
          </p>

          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <Mail className="w-4 h-4" /> Kontakt aufnehmen
          </Link>
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
