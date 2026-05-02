"use client";

import PostCard from "./post-card";
import NewsletterBlock from "./newsletter-block";
import {
  ArrowRight,
  Plane,
  TrendingUp,
  Compass,
  Building2,
  Palmtree,
  Mountain,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface HomeContentProps {
  posts: any[];
  categories: any[];
  popularPosts: any[];
  search: string;
  settings?: {
    siteName?: string | null;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    heroImageUrl?: string | null;
    heroPrimaryCtaText?: string | null;
    heroPrimaryCtaHref?: string | null;
    heroSecondaryCtaText?: string | null;
    heroSecondaryCtaHref?: string | null;
    showHeroSection?: boolean | null;
    showFeaturedSection?: boolean | null;
    showCategorySection?: boolean | null;
    showPopularSection?: boolean | null;
    showNewsletterSection?: boolean | null;
    featuredPostsCount?: number | null;
    latestPostsCount?: number | null;
    popularPostsCount?: number | null;
  };
}

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  städtereisen: Building2,
  strandurlaub: Palmtree,
  "berge & natur": Mountain,
  "kulinarische reisen": UtensilsCrossed,
};

function getCategoryIcon(name: string) {
  return CATEGORY_ICONS[name.toLowerCase()] || Plane;
}

export default function HomeContent({
  posts,
  categories,
  popularPosts,
  search,
  settings,
}: HomeContentProps) {
  const featuredCount = settings?.featuredPostsCount || 3;
  const latestCount = settings?.latestPostsCount || 6;
  const popularCount = settings?.popularPostsCount || 5;

  const showHeroSection = settings?.showHeroSection ?? true;
  const showFeaturedSection = settings?.showFeaturedSection ?? true;
  const showCategorySection = settings?.showCategorySection ?? true;
  const showPopularSection = settings?.showPopularSection ?? true;
  const showNewsletterSection = settings?.showNewsletterSection ?? true;

  const heroTitle = settings?.heroTitle || "Entdecken Sie die Welt mit uns";
  const heroSubtitle =
    settings?.heroSubtitle ||
    "Inspirierende Reiseberichte, praktische Tipps und die schönsten Reiseziele — alles in einem Magazin.";
  const heroImageUrl = settings?.heroImageUrl || "/images/hero.jpg";
  const heroPrimaryCtaText = settings?.heroPrimaryCtaText || "Entdecken";
  const heroPrimaryCtaHref = settings?.heroPrimaryCtaHref || "#featured";
  const heroSecondaryCtaText = settings?.heroSecondaryCtaText || "Über uns";
  const heroSecondaryCtaHref = settings?.heroSecondaryCtaHref || "/ueber-uns";

  const featured = posts.slice(0, featuredCount);
  const latest = posts.slice(featuredCount, featuredCount + latestCount);

  const featuredIds = new Set(featured.map((p: any) => p.id));
  const filteredPopular = (popularPosts ?? [])
    .filter((p: any) => !featuredIds.has(p.id))
    .slice(0, popularCount);

  if (search) {
    return (
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">
              Suchergebnisse für:{" "}
              <span className="font-semibold text-foreground">"{search}"</span>
              <Link
                href="/"
                className="ml-3 text-primary hover:underline text-sm"
              >
                Zurücksetzen
              </Link>
            </p>
          </div>

          {(posts?.length ?? 0) === 0 ? (
            <div className="text-center py-20">
              <Plane className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Keine Beiträge gefunden.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(posts ?? []).map((post: any, i: number) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {showHeroSection && (
        <section className="relative overflow-hidden">
          <div className="relative h-[70vh] min-h-[500px] max-h-[700px]">
            <Image
              src={heroImageUrl}
              alt="Wunderschöne Reiselandschaft - Küstenstadt in Europa"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-20 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
                    <Compass className="w-4 h-4" /> Reisegeschichten aus aller
                    Welt
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-4 max-w-3xl">
                    {heroTitle}
                  </h1>

                  <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-8">
                    {heroSubtitle}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={heroPrimaryCtaHref}
                      className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                    >
                      {heroPrimaryCtaText} <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href={heroSecondaryCtaHref}
                      className="px-6 py-3 bg-white/15 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/25 transition-colors border border-white/20"
                    >
                      {heroSecondaryCtaText}
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {showFeaturedSection && featured.length > 0 && (
        <section
          id="featured"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                Ausgewählte Beiträge
              </h2>
              <p className="text-muted-foreground mt-1">
                Unsere Top-Empfehlungen für Ihre nächste Reise
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((post: any, i: number) => (
              <PostCard key={post.id} post={post} index={i} variant="default" />
            ))}
          </div>
        </section>
      )}

      {showCategorySection && (categories?.length ?? 0) > 0 && (
        <section className="bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                Reisekategorien
              </h2>
              <p className="text-muted-foreground mt-2">
                Entdecken Sie Reiseziele nach Ihren Interessen
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {(categories ?? []).map((cat: any, i: number) => {
                const Icon = getCategoryIcon(cat.name);

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Link
                      href={`/category/${cat.slug}`}
                      className="block p-6 bg-card rounded-2xl shadow-sm hover:shadow-lg border border-border/30 transition-all duration-300 group text-center"
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                        <Icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                      </div>

                      <h3 className="font-display font-bold text-base tracking-tight group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>

                      <p className="text-xs text-muted-foreground mt-1">
                        {cat.postCount}{" "}
                        {cat.postCount === 1 ? "Beitrag" : "Beiträge"}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                Neueste Artikel
              </h2>
            </div>

            {latest.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {latest.map((post: any, i: number) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </div>
            ) : posts.length <= featuredCount && posts.length > 0 ? (
              <p className="text-muted-foreground py-8">
                Weitere Artikel folgen in Kürze.
              </p>
            ) : (
              <div className="text-center py-16">
                <Plane className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Noch keine Beiträge veröffentlicht.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-10">
            {showPopularSection && filteredPopular.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-display font-bold">Beliebt</h3>
                </div>

                <div className="space-y-5">
                  {filteredPopular.map((post: any, i: number) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      index={i}
                      variant="horizontal"
                    />
                  ))}
                </div>
              </div>
            )}

            {showNewsletterSection && (
              <div>
                <NewsletterBlock />
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
