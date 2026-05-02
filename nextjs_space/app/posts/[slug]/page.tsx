export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";
import PostDetailClient from "@/components/public/post-detail-client";
import RelatedPosts from "@/components/public/related-posts";
import NewsletterBlock from "@/components/public/newsletter-block";
import { getFooterData } from "@/lib/footer-data";
import { calculateReadingTime } from "@/lib/reading-time";
import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site-config";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      coverImage: { select: { url: true } },
      author: { select: { name: true } },
    },
  });
  if (!post || post.status !== "PUBLISHED") return { title: "Nicht gefunden" };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || "",
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author?.name ?? ""],
      images: post.coverImage?.url ? [{ url: post.coverImage.url }] : [],
      url: `${siteUrl}/posts/${post.slug}`,
    },
    alternates: { canonical: `${siteUrl}/posts/${post.slug}` },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const config = await getSiteConfig();
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { name: true, avatar: true, bio: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      coverImage: { select: { url: true } },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  if (!post || post.status !== "PUBLISHED") return notFound();

  const readingTime = calculateReadingTime(post.content ?? "");

  // Fetch related posts (same category or shared tags)
  const tagIds = (post.tags ?? []).map((pt: any) => pt.tag.id);
  const relatedPosts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: post.id },
      OR: [
        ...(post.categoryId ? [{ categoryId: post.categoryId }] : []),
        ...(tagIds.length > 0
          ? [{ tags: { some: { tagId: { in: tagIds } } } }]
          : []),
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      coverImage: { select: { url: true } },
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  // Next/Prev posts
  const [prevPost, nextPost] = await Promise.all([
    prisma.post.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: { lt: post.publishedAt ?? undefined },
      },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.post.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: { gt: post.publishedAt ?? undefined },
      },
      orderBy: { publishedAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  const footerData = await getFooterData();

  const serialized = {
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImage?.url ?? null,
    authorName: post.author?.name ?? "",
    authorSlug: post.author?.slug ?? null,
    authorAvatar: post.author?.avatar ?? null,
    authorBio: post.author?.bio ?? null,
    categoryName: post.category?.name ?? null,
    categorySlug: post.category?.slug ?? null,
    publishedAt: post.publishedAt?.toISOString?.() ?? "",
    tags: (post.tags ?? []).map((pt: any) => ({
      name: pt.tag.name,
      slug: pt.tag.slug,
    })),
    readingTime,
    slug: post.slug,
    prevPost: prevPost ? { slug: prevPost.slug, title: prevPost.title } : null,
    nextPost: nextPost ? { slug: nextPost.slug, title: nextPost.title } : null,
  };

  const related = (relatedPosts ?? []).map((p: any) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImage?.url ?? null,
    authorName: p.author?.name ?? "",
    categoryName: p.category?.name ?? null,
  }));

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    image: post.coverImage?.url || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.name ?? "",
      url: post.author?.slug
        ? `${siteUrl}/autor/${post.author.slug}`
        : undefined,
    },
    publisher: {
      "@type": "Organization",
      name: "Reiseblog",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/posts/${post.slug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: siteUrl },
      ...(post.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: post.category.name,
              item: `${siteUrl}/category/${post.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: post.category ? 3 : 2,
        name: post.title,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <PublicHeader
        settings={{
          siteName: config.siteName,
          siteTagline: config.siteTagline,
          logoText: config.logoText,
        }}
      />
      <PostDetailClient post={serialized} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <RelatedPosts posts={related} />
        <div className="mt-10 mb-4">
          <NewsletterBlock />
        </div>
      </div>
      <PublicFooter
        categories={footerData.categories}
        recentPosts={footerData.recentPosts}
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
