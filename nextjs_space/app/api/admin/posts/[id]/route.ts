export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import {
  deleteAllPostMedia,
  cleanupOrphanedMedia,
  extractImageUrlsFromHtml,
} from "@/lib/media-cleanup";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, id: true } },
      coverImage: { select: { id: true, url: true } },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
      media: true,
    },
  });

  if (!post) {
    return NextResponse.json(
      { error: "Không tìm thấy bài viết." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ...post,
    tags: (post.tags ?? []).map((pt: any) => ({
      id: pt.tag.id,
      name: pt.tag.name,
      slug: pt.tag.slug,
    })),
    createdAt: post.createdAt?.toISOString?.(),
    updatedAt: post.updatedAt?.toISOString?.(),
    publishedAt: post.publishedAt?.toISOString?.() ?? null,
    coverImage: post.coverImage
      ? { ...post.coverImage, createdAt: undefined }
      : null,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    slug,
    excerpt,
    content,
    categoryId,
    authorId,
    metaTitle,
    metaDescription,
    status,
    coverImageId,
    tagIds,
  } = body;

  if (!title?.trim()) {
    return NextResponse.json(
      { error: "Tiêu đề không được để trống." },
      { status: 400 },
    );
  }

  if (!slug?.trim()) {
    return NextResponse.json(
      { error: "Slug không được để trống." },
      { status: 400 },
    );
  }

  const slugExists = await prisma.post.findFirst({
    where: { slug, NOT: { id: params.id } },
  });

  if (slugExists) {
    return NextResponse.json({ error: "Slug đã tồn tại." }, { status: 400 });
  }

  const existingPost = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      category: { select: { slug: true } },
      author: { select: { slug: true } },
      tags: {
        include: { tag: { select: { slug: true } } },
      },
    },
  });

  if (!existingPost) {
    return NextResponse.json(
      { error: "Không tìm thấy bài viết." },
      { status: 404 },
    );
  }

  await cleanupOrphanedMedia(params.id, content ?? "", coverImageId || null);

  await prisma.postTag.deleteMany({ where: { postId: params.id } });

  if (tagIds?.length) {
    await prisma.postTag.createMany({
      data: tagIds.map((tid: string) => ({
        postId: params.id,
        tagId: tid,
      })),
      skipDuplicates: true,
    });
  }

  const shouldPublish =
    status === "PUBLISHED" && existingPost.status !== "PUBLISHED";

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt?.trim() || null,
      content: content || null,
      categoryId: categoryId || null,
      authorId: authorId || existingPost.authorId,
      metaTitle: metaTitle?.trim() || null,
      metaDescription: metaDescription?.trim() || null,
      status: status || existingPost.status,
      coverImageId: coverImageId || null,
      publishedAt: shouldPublish
        ? new Date()
        : status === "DRAFT"
          ? null
          : existingPost.publishedAt,
    },
    include: {
      category: { select: { slug: true } },
      author: { select: { slug: true } },
      tags: {
        include: { tag: { select: { slug: true } } },
      },
    },
  });

  if (content) {
    const urls = extractImageUrlsFromHtml(content);
    if (urls.length > 0) {
      await prisma.media.updateMany({
        where: { url: { in: urls }, postId: null },
        data: { postId: post.id },
      });
    }
  }

  // Revalidate public pages
  revalidatePath("/");
  revalidatePath(`/posts/${post.slug}`);

  // old post path in case slug changed
  if (existingPost.slug && existingPost.slug !== post.slug) {
    revalidatePath(`/posts/${existingPost.slug}`);
  }

  // category pages
  if (existingPost.category?.slug) {
    revalidatePath(`/category/${existingPost.category.slug}`);
  }
  if (
    post.category?.slug &&
    post.category.slug !== existingPost.category?.slug
  ) {
    revalidatePath(`/category/${post.category.slug}`);
  }

  // author pages
  if (existingPost.author?.slug) {
    revalidatePath(`/autor/${existingPost.author.slug}`);
  }
  if (post.author?.slug && post.author.slug !== existingPost.author?.slug) {
    revalidatePath(`/autor/${post.author.slug}`);
  }

  // tag pages: old + new
  const oldTagSlugs = (existingPost.tags ?? [])
    .map((t: any) => t.tag?.slug)
    .filter(Boolean);

  const newTagSlugs = (post.tags ?? [])
    .map((t: any) => t.tag?.slug)
    .filter(Boolean);

  for (const tagSlug of new Set([...oldTagSlugs, ...newTagSlugs])) {
    revalidatePath(`/tag/${tagSlug}`);
  }

  return NextResponse.json(post);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      category: { select: { slug: true } },
      author: { select: { slug: true } },
      tags: {
        include: { tag: { select: { slug: true } } },
      },
    },
  });

  if (!post) {
    return NextResponse.json(
      { error: "Không tìm thấy bài viết." },
      { status: 404 },
    );
  }

  if (post.coverImageId) {
    await prisma.post.update({
      where: { id: params.id },
      data: { coverImageId: null },
    });
  }

  await deleteAllPostMedia(params.id);
  await prisma.postTag.deleteMany({ where: { postId: params.id } });
  await prisma.post.delete({ where: { id: params.id } });

  // Revalidate public pages after delete
  revalidatePath("/");
  revalidatePath(`/posts/${post.slug}`);

  if (post.category?.slug) {
    revalidatePath(`/category/${post.category.slug}`);
  }

  if (post.author?.slug) {
    revalidatePath(`/autor/${post.author.slug}`);
  }

  for (const pt of post.tags ?? []) {
    if (pt.tag?.slug) {
      revalidatePath(`/tag/${pt.tag.slug}`);
    }
  }

  return NextResponse.json({ success: true });
}
