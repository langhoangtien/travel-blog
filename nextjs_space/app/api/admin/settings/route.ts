export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { getSiteConfig } from "@/lib/site-config";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getSiteConfig();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const existing = await getSiteConfig();

  const config = await prisma.siteConfig.update({
    where: { id: existing.id },
    data: {
      siteName: body.siteName ?? existing.siteName,
      siteTagline: body.siteTagline ?? null,
      siteDescription: body.siteDescription ?? null,
      siteUrl: body.siteUrl ?? null,
      contactEmail: body.contactEmail ?? null,
      contactPhone: body.contactPhone ?? null,
      locationText: body.locationText ?? null,

      logoText: body.logoText ?? null,
      logoImageUrl: body.logoImageUrl ?? null,
      faviconUrl: body.faviconUrl ?? null,
      defaultOgImageUrl: body.defaultOgImageUrl ?? null,

      primaryColor: body.primaryColor ?? existing.primaryColor,

      showSearch:
        typeof body.showSearch === "boolean"
          ? body.showSearch
          : existing.showSearch,

      showCategoriesInHeader:
        typeof body.showCategoriesInHeader === "boolean"
          ? body.showCategoriesInHeader
          : existing.showCategoriesInHeader,

      showFooterCategories:
        typeof body.showFooterCategories === "boolean"
          ? body.showFooterCategories
          : existing.showFooterCategories,

      showFooterRecentPosts:
        typeof body.showFooterRecentPosts === "boolean"
          ? body.showFooterRecentPosts
          : existing.showFooterRecentPosts,

      heroTitle: body.heroTitle ?? null,
      heroSubtitle: body.heroSubtitle ?? null,
      heroImageUrl: body.heroImageUrl ?? null,
      heroPrimaryCtaText: body.heroPrimaryCtaText ?? null,
      heroPrimaryCtaHref: body.heroPrimaryCtaHref ?? null,
      heroSecondaryCtaText: body.heroSecondaryCtaText ?? null,
      heroSecondaryCtaHref: body.heroSecondaryCtaHref ?? null,

      footerDescription: body.footerDescription ?? null,
      footerCopyright: body.footerCopyright ?? null,

      facebookUrl: body.facebookUrl ?? null,
      instagramUrl: body.instagramUrl ?? null,
      youtubeUrl: body.youtubeUrl ?? null,
      tiktokUrl: body.tiktokUrl ?? null,

      showHeroSection:
        typeof body.showHeroSection === "boolean"
          ? body.showHeroSection
          : existing.showHeroSection,

      showFeaturedSection:
        typeof body.showFeaturedSection === "boolean"
          ? body.showFeaturedSection
          : existing.showFeaturedSection,

      showCategorySection:
        typeof body.showCategorySection === "boolean"
          ? body.showCategorySection
          : existing.showCategorySection,

      showPopularSection:
        typeof body.showPopularSection === "boolean"
          ? body.showPopularSection
          : existing.showPopularSection,

      showNewsletterSection:
        typeof body.showNewsletterSection === "boolean"
          ? body.showNewsletterSection
          : existing.showNewsletterSection,

      featuredPostsCount:
        typeof body.featuredPostsCount === "number"
          ? body.featuredPostsCount
          : Number(body.featuredPostsCount ?? existing.featuredPostsCount),

      latestPostsCount:
        typeof body.latestPostsCount === "number"
          ? body.latestPostsCount
          : Number(body.latestPostsCount ?? existing.latestPostsCount),

      popularPostsCount:
        typeof body.popularPostsCount === "number"
          ? body.popularPostsCount
          : Number(body.popularPostsCount ?? existing.popularPostsCount),

      contentImageMaxWidth:
        typeof body.contentImageMaxWidth === "number"
          ? body.contentImageMaxWidth
          : Number(body.contentImageMaxWidth ?? existing.contentImageMaxWidth),

      contentImageQuality:
        typeof body.contentImageQuality === "number"
          ? body.contentImageQuality
          : Number(body.contentImageQuality ?? existing.contentImageQuality),

      coverImageMaxWidth:
        typeof body.coverImageMaxWidth === "number"
          ? body.coverImageMaxWidth
          : Number(body.coverImageMaxWidth ?? existing.coverImageMaxWidth),

      coverImageQuality:
        typeof body.coverImageQuality === "number"
          ? body.coverImageQuality
          : Number(body.coverImageQuality ?? existing.coverImageQuality),

      avatarImageMaxWidth:
        typeof body.avatarImageMaxWidth === "number"
          ? body.avatarImageMaxWidth
          : Number(body.avatarImageMaxWidth ?? existing.avatarImageMaxWidth),

      avatarImageQuality:
        typeof body.avatarImageQuality === "number"
          ? body.avatarImageQuality
          : Number(body.avatarImageQuality ?? existing.avatarImageQuality),

      imageFormat: body.imageFormat ?? existing.imageFormat,

      enableImageOptimization:
        typeof body.enableImageOptimization === "boolean"
          ? body.enableImageOptimization
          : existing.enableImageOptimization,
    },
  });

  revalidatePath("/");
  revalidatePath("/ueber-uns");
  revalidatePath("/kontakt");

  return NextResponse.json(config);
}
