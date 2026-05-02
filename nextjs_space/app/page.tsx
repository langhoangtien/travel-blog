import { prisma } from "@/lib/db";
import { getSiteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";
import HomeContent from "@/components/public/home-content";

export const revalidate = 900;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams?.search ?? "";
  const config = await getSiteConfig();

  const featuredPostsCount = config.featuredPostsCount || 3;
  const latestPostsCount = config.latestPostsCount || 6;
  const popularPostsCount = config.popularPostsCount || 5;

  const totalPostsNeeded = featuredPostsCount + latestPostsCount;

  const where: any = { status: "PUBLISHED" as const };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  const [allPosts, categories, popularPosts] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: totalPostsNeeded + 6,
      include: {
        author: { select: { name: true, avatar: true, slug: true } },
        category: { select: { name: true, slug: true } },
        coverImage: { select: { url: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: popularPostsCount,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        coverImage: { select: { url: true } },
      },
    }),
  ]);

  const serialize = (p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImage?.url ?? null,
    authorName: p.author?.name ?? "",
    authorSlug: p.author?.slug ?? null,
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
    publishedAt: p.publishedAt?.toISOString?.() ?? "",
    viewCount: p.viewCount ?? 0,
  });

  const serializedPosts = (allPosts ?? []).map(serialize);
  const serializedPopular = (popularPosts ?? []).map(serialize);

  const serializedCategories = (categories ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    postCount: c._count?.posts ?? 0,
  }));

  const recentForFooter = serializedPosts.slice(0, 4).map((p: any) => ({
    title: p.title,
    slug: p.slug,
  }));

  const siteUrl =
    config.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.siteName || "Reiseblog",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />

      <PublicHeader
        settings={{
          siteName: config.siteName,
          siteTagline: config.siteTagline,
          logoText: config.logoText,
        }}
      />

      <HomeContent
        posts={serializedPosts}
        categories={serializedCategories}
        popularPosts={serializedPopular}
        search={search}
        settings={{
          siteName: config.siteName,
          heroTitle: config.heroTitle,
          heroSubtitle: config.heroSubtitle,
          heroImageUrl: config.heroImageUrl,
          heroPrimaryCtaText: config.heroPrimaryCtaText,
          heroPrimaryCtaHref: config.heroPrimaryCtaHref,
          heroSecondaryCtaText: config.heroSecondaryCtaText,
          heroSecondaryCtaHref: config.heroSecondaryCtaHref,
          showHeroSection: config.showHeroSection,
          showFeaturedSection: config.showFeaturedSection,
          showCategorySection: config.showCategorySection,
          showPopularSection: config.showPopularSection,
          showNewsletterSection: config.showNewsletterSection,
          featuredPostsCount: config.featuredPostsCount,
          latestPostsCount: config.latestPostsCount,
          popularPostsCount: config.popularPostsCount,
        }}
      />

      <PublicFooter
        categories={serializedCategories}
        recentPosts={recentForFooter}
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
