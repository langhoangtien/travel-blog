import { prisma } from "@/lib/db";

export async function getSiteConfig() {
  let config = await prisma.siteConfig.findFirst();

  if (!config) {
    config = await prisma.siteConfig.create({
      data: {
        siteName: "Reiseblog",
        logoText: "Reiseblog",
        siteTagline: "Reisegeschichten & Tipps",
        siteDescription:
          "Inspirierende Reiseberichte, praktische Tipps und die schönsten Reiseziele.",
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        locationText: "Weltweit unterwegs",

        primaryColor: "sky-blue",

        showSearch: true,
        showCategoriesInHeader: true,
        showFooterCategories: true,
        showFooterRecentPosts: true,

        heroTitle: "Entdecken Sie die Welt mit uns",
        heroSubtitle:
          "Inspirierende Reiseberichte, praktische Tipps und die schönsten Reiseziele — alles in einem Magazin.",
        heroImageUrl: "/images/hero.jpg",
        heroPrimaryCtaText: "Entdecken",
        heroPrimaryCtaHref: "#featured",
        heroSecondaryCtaText: "Über uns",
        heroSecondaryCtaHref: "/ueber-uns",

        footerDescription:
          "Inspirierende Reisegeschichten, praktische Tipps und die schönsten Reiseziele — von Reisenden für Reisende.",
        footerCopyright: "© 2026 Reiseblog. Alle Rechte vorbehalten.",

        showHeroSection: true,
        showFeaturedSection: true,
        showCategorySection: true,
        showPopularSection: true,
        showNewsletterSection: true,

        featuredPostsCount: 3,
        latestPostsCount: 6,
        popularPostsCount: 5,

        contentImageMaxWidth: 1600,
        contentImageQuality: 80,

        coverImageMaxWidth: 1920,
        coverImageQuality: 82,

        avatarImageMaxWidth: 400,
        avatarImageQuality: 80,

        imageFormat: "webp",
        enableImageOptimization: true,
      },
    });
  }

  return config;
}
