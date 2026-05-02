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
  const { name } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Tên tag không được để trống." },
      { status: 400 },
    );
  }

  const existingTag = await prisma.tag.findUnique({
    where: { id: params.id },
    include: {
      posts: {
        include: {
          post: {
            select: {
              slug: true,
              category: { select: { slug: true } },
              author: { select: { slug: true } },
            },
          },
        },
      },
    },
  });

  if (!existingTag) {
    return NextResponse.json({ error: "Không tìm thấy tag." }, { status: 404 });
  }

  const slug = slugify(name);

  const existing = await prisma.tag.findFirst({
    where: { slug, NOT: { id: params.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "Slug đã tồn tại." }, { status: 400 });
  }

  const tag = await prisma.tag.update({
    where: { id: params.id },
    data: { name: name.trim(), slug },
  });

  // revalidate old and new tag page
  revalidatePath(`/tag/${existingTag.slug}`);
  revalidatePath(`/tag/${tag.slug}`);

  // revalidate related public pages
  revalidatePath("/");

  for (const pt of existingTag.posts ?? []) {
    const post = pt.post;
    if (!post) continue;

    if (post.slug) {
      revalidatePath(`/posts/${post.slug}`);
    }
    if (post.category?.slug) {
      revalidatePath(`/category/${post.category.slug}`);
    }
    if (post.author?.slug) {
      revalidatePath(`/autor/${post.author.slug}`);
    }
  }

  return NextResponse.json(tag);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingTag = await prisma.tag.findUnique({
    where: { id: params.id },
    include: {
      posts: {
        include: {
          post: {
            select: {
              slug: true,
              category: { select: { slug: true } },
              author: { select: { slug: true } },
            },
          },
        },
      },
    },
  });

  if (!existingTag) {
    return NextResponse.json({ error: "Không tìm thấy tag." }, { status: 404 });
  }

  await prisma.tag.delete({ where: { id: params.id } });

  revalidatePath("/");
  revalidatePath(`/tag/${existingTag.slug}`);

  for (const pt of existingTag.posts ?? []) {
    const post = pt.post;
    if (!post) continue;

    if (post.slug) {
      revalidatePath(`/posts/${post.slug}`);
    }
    if (post.category?.slug) {
      revalidatePath(`/category/${post.category.slug}`);
    }
    if (post.author?.slug) {
      revalidatePath(`/autor/${post.author.slug}`);
    }
  }

  return NextResponse.json({ success: true });
}
