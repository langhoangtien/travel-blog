import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";
import PostCard from "@/components/public/post-card";
import { getFooterData } from "@/lib/footer-data";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { User, ArrowLeft } from "lucide-react";

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
  const user = await prisma.user.findFirst({
    where: { slug: params.slug, active: true },
  });

  if (!user) {
    return { title: "Nicht gefunden" };
  }

  return {
    title: `${user.name} – Autor – Reiseblog`,
    description: user.bio || `Beiträge von ${user.name}`,
    alternates: {
      canonical: `/author/${user.slug}`,
    },
    openGraph: {
      title: `${user.name} – Autor – Reiseblog`,
      description: user.bio || `Beiträge von ${user.name}`,
      url: `/author/${user.slug}`,
      images: user.avatar ? [{ url: user.avatar }] : [],
    },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const user = await prisma.user.findFirst({
    where: { slug: params.slug, active: true },
  });

  if (!user) return notFound();

  const [posts, footerData] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED", authorId: user.id },
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        coverImage: { select: { url: true } },
      },
    }),
    getFooterData(),
  ]);

  const serialized = (posts ?? []).map((p: any) => ({
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

        <div className="flex items-center gap-5 mb-10">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={80}
                height={80}
                className="rounded-2xl object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              {user.name}
            </h1>

            {user.bio && (
              <p className="text-muted-foreground mt-2">{user.bio}</p>
            )}

            <p className="text-sm text-muted-foreground mt-1">
              {serialized.length}{" "}
              {serialized.length === 1 ? "Beitrag" : "Beiträge"}
            </p>
          </div>
        </div>

        {serialized.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Keine Beiträge von diesem Autor.
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
