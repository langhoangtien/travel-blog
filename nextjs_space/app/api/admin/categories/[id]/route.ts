export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Tên danh mục không được để trống." },
      { status: 400 },
    );
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      posts: {
        include: {
          author: { select: { slug: true } },
          tags: {
            include: { tag: { select: { slug: true } } },
          },
        },
      },
    },
  });

  if (!existingCategory) {
    return NextResponse.json(
      { error: "Không tìm thấy danh mục." },
      { status: 404 },
    );
  }

  const slug = slugify(name);

  const existing = await prisma.category.findFirst({
    where: { slug, NOT: { id: params.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "Slug đã tồn tại." }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id: params.id },
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
    },
  });

  // Revalidate old and new category page
  revalidatePath(`/category/${existingCategory.slug}`);
  revalidatePath(`/category/${category.slug}`);

  // Revalidate homepage
  revalidatePath("/");

  // Revalidate related post/author/tag pages
  for (const post of existingCategory.posts ?? []) {
    if (post.slug) {
      revalidatePath(`/posts/${post.slug}`);
    }

    if (post.author?.slug) {
      revalidatePath(`/autor/${post.author.slug}`);
    }

    for (const pt of post.tags ?? []) {
      if (pt.tag?.slug) {
        revalidatePath(`/tag/${pt.tag.slug}`);
      }
    }
  }

  return NextResponse.json(category);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      posts: {
        include: {
          author: { select: { slug: true } },
          tags: {
            include: { tag: { select: { slug: true } } },
          },
        },
      },
    },
  });

  if (!existingCategory) {
    return NextResponse.json(
      { error: "Không tìm thấy danh mục." },
      { status: 404 },
    );
  }

  const postCount = existingCategory.posts?.length ?? 0;

  if (postCount > 0) {
    return NextResponse.json(
      { error: `Không thể xóa. Danh mục đang có ${postCount} bài viết.` },
      { status: 400 },
    );
  }

  await prisma.category.delete({ where: { id: params.id } });

  revalidatePath("/");
  revalidatePath(`/category/${existingCategory.slug}`);

  return NextResponse.json({ success: true });
}
