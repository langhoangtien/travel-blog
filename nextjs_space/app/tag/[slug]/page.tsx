import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";
import PostCard from "@/components/public/post-card";
import { getFooterData } from "@/lib/footer-data";
import type { Metadata } from "next";
import Link from "next/link";
import { Tag, ArrowLeft } from "lucide-react";

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const tag = await prisma.tag.findUnique({
    where: { slug: params.slug },
  });

  if (!tag) {
    return { title: "Nicht gefunden" };
  }

  return {
    title: `${tag.name} – Reiseblog`,
    description: `Alle Beiträge mit dem Schlagwort ${tag.name}`,
    alternates: {
      canonical: `/tag/${tag.slug}`,
    },
    openGraph: {
      title: `${tag.name} – Reiseblog`,
      description: `Alle Beiträge mit dem Schlagwort ${tag.name}`,
      url: `/tag/${tag.slug}`,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const tag = await prisma.tag.findUnique({
    where: { slug: params.slug },
  });

  if (!tag) return notFound();

  const [postTags, footerData] = await Promise.all([
    prisma.postTag.findMany({
      where: { tagId: tag.id },
      include: {
        post: {
          include: {
            author: { select: { name: true } },
            category: { select: { name: true, slug: true } },
            coverImage: { select: { url: true } },
          },
        },
      },
    }),
    getFooterData(),
  ]);

  const posts = (postTags ?? [])
    .map((pt: any) => pt.post)
    .filter((p: any) => p?.status === "PUBLISHED")
    .sort(
      (a: any, b: any) =>
        new Date(b.publishedAt ?? 0).getTime() -
        new Date(a.publishedAt ?? 0).getTime(),
    );

  const serialized = posts.map((p: any) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImage?.url ?? null,
    authorName: p.author?.name ?? "",
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
    publishedAt: p.publishedAt?.toISOString?.() ?? "",
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary" />
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              {tag.name}
            </h1>
          </div>

          <p className="text-sm text-muted-foreground ml-[52px]">
            {serialized.length}{" "}
            {serialized.length === 1 ? "Beitrag" : "Beiträge"}
          </p>
        </div>

        {serialized.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Keine Beiträge mit diesem Schlagwort.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serialized.map((post: any, i: number) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        )}
      </main>

      <PublicFooter
        categories={footerData.categories}
        recentPosts={footerData.recentPosts}
      />
    </div>
  );
}
