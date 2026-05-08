import { prisma } from "@/lib/db";
import type { SiteConfig } from "@prisma/client";

export const defaultSiteConfig: SiteConfig = {
  id: "default-site-config",

  siteName: "Reiseblog",
  siteTagline: "Reisegeschichten & Tipps",
  siteDescription:
    "Inspirierende Reiseberichte, praktische Tipps und die schönsten Reiseziele.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  contactEmail: null,
  contactPhone: null,
  locationText: "Weltweit unterwegs",

  logoText: "Reiseblog",
  logoImageUrl: null,
  faviconUrl: null,
  defaultOgImageUrl: null,

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

  facebookUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  tiktokUrl: null,

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

  createdAt: new Date(0),
  updatedAt: new Date(0),
};

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!process.env.DATABASE_URL) {
    return defaultSiteConfig;
  }

  let config = await prisma.siteConfig.findFirst();

  if (!config) {
    config = await prisma.siteConfig.create({
      data: {
        siteName: defaultSiteConfig.siteName,
        siteTagline: defaultSiteConfig.siteTagline,
        siteDescription: defaultSiteConfig.siteDescription,
        siteUrl: defaultSiteConfig.siteUrl,
        contactEmail: defaultSiteConfig.contactEmail,
        contactPhone: defaultSiteConfig.contactPhone,
        locationText: defaultSiteConfig.locationText,

        logoText: defaultSiteConfig.logoText,
        logoImageUrl: defaultSiteConfig.logoImageUrl,
        faviconUrl: defaultSiteConfig.faviconUrl,
        defaultOgImageUrl: defaultSiteConfig.defaultOgImageUrl,

        primaryColor: defaultSiteConfig.primaryColor,

        showSearch: defaultSiteConfig.showSearch,
        showCategoriesInHeader: defaultSiteConfig.showCategoriesInHeader,
        showFooterCategories: defaultSiteConfig.showFooterCategories,
        showFooterRecentPosts: defaultSiteConfig.showFooterRecentPosts,

        heroTitle: defaultSiteConfig.heroTitle,
        heroSubtitle: defaultSiteConfig.heroSubtitle,
        heroImageUrl: defaultSiteConfig.heroImageUrl,
        heroPrimaryCtaText: defaultSiteConfig.heroPrimaryCtaText,
        heroPrimaryCtaHref: defaultSiteConfig.heroPrimaryCtaHref,
        heroSecondaryCtaText: defaultSiteConfig.heroSecondaryCtaText,
        heroSecondaryCtaHref: defaultSiteConfig.heroSecondaryCtaHref,

        footerDescription: defaultSiteConfig.footerDescription,
        footerCopyright: defaultSiteConfig.footerCopyright,

        facebookUrl: defaultSiteConfig.facebookUrl,
        instagramUrl: defaultSiteConfig.instagramUrl,
        youtubeUrl: defaultSiteConfig.youtubeUrl,
        tiktokUrl: defaultSiteConfig.tiktokUrl,

        showHeroSection: defaultSiteConfig.showHeroSection,
        showFeaturedSection: defaultSiteConfig.showFeaturedSection,
        showCategorySection: defaultSiteConfig.showCategorySection,
        showPopularSection: defaultSiteConfig.showPopularSection,
        showNewsletterSection: defaultSiteConfig.showNewsletterSection,

        featuredPostsCount: defaultSiteConfig.featuredPostsCount,
        latestPostsCount: defaultSiteConfig.latestPostsCount,
        popularPostsCount: defaultSiteConfig.popularPostsCount,

        contentImageMaxWidth: defaultSiteConfig.contentImageMaxWidth,
        contentImageQuality: defaultSiteConfig.contentImageQuality,

        coverImageMaxWidth: defaultSiteConfig.coverImageMaxWidth,
        coverImageQuality: defaultSiteConfig.coverImageQuality,

        avatarImageMaxWidth: defaultSiteConfig.avatarImageMaxWidth,
        avatarImageQuality: defaultSiteConfig.avatarImageQuality,

        imageFormat: defaultSiteConfig.imageFormat,
        enableImageOptimization: defaultSiteConfig.enableImageOptimization,
      },
    });
  }

  return config;
}
