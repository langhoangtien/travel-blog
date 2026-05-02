import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') ?? 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const siteUrl = `${protocol}://${host}`;

  const [posts, categories, tags, users] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.tag.findMany({ select: { slug: true, createdAt: true } }),
    prisma.user.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const postUrls = (posts ?? []).map((p: any) => ({
    url: `${siteUrl}/posts/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = (categories ?? []).map((c: any) => ({
    url: `${siteUrl}/category/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const tagUrls = (tags ?? []).map((t: any) => ({
    url: `${siteUrl}/tag/${t.slug}`,
    lastModified: t.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  const authorUrls = (users ?? []).filter((u: any) => u.slug).map((u: any) => ({
    url: `${siteUrl}/autor/${u.slug}`,
    lastModified: u.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postUrls,
    ...categoryUrls,
    ...tagUrls,
    ...authorUrls,
  ];
}
