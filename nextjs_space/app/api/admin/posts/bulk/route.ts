export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { deleteAllPostMedia } from "@/lib/media-cleanup";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action, postIds } = body;

  if (!postIds?.length) {
    return NextResponse.json(
      { error: "Vui lòng chọn bài viết." },
      { status: 400 },
    );
  }

  // Lấy dữ liệu cũ để biết cần revalidate path nào
  const existingPosts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    include: {
      category: { select: { slug: true } },
      author: { select: { slug: true } },
      tags: {
        include: { tag: { select: { slug: true } } },
      },
    },
  });

  const pathsToRevalidate = new Set<string>();
  pathsToRevalidate.add("/");

  for (const post of existingPosts) {
    if (post.slug) {
      pathsToRevalidate.add(`/posts/${post.slug}`);
    }
    if (post.category?.slug) {
      pathsToRevalidate.add(`/category/${post.category.slug}`);
    }
    if (post.author?.slug) {
      pathsToRevalidate.add(`/autor/${post.author.slug}`);
    }
    for (const pt of post.tags ?? []) {
      if (pt.tag?.slug) {
        pathsToRevalidate.add(`/tag/${pt.tag.slug}`);
      }
    }
  }

  switch (action) {
    case "publish": {
      await prisma.post.updateMany({
        where: { id: { in: postIds } },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      for (const path of pathsToRevalidate) {
        revalidatePath(path);
      }

      return NextResponse.json({
        success: true,
        message: `Đã xuất bản ${postIds.length} bài viết.`,
      });
    }

    case "draft": {
      await prisma.post.updateMany({
        where: { id: { in: postIds } },
        data: { status: "DRAFT" },
      });

      for (const path of pathsToRevalidate) {
        revalidatePath(path);
      }

      return NextResponse.json({
        success: true,
        message: `Đã chuyển ${postIds.length} bài viết về nháp.`,
      });
    }

    case "delete": {
      for (const id of postIds) {
        const post = await prisma.post.findUnique({ where: { id } });

        if (post) {
          if (post.coverImageId) {
            await prisma.post.update({
              where: { id },
              data: { coverImageId: null },
            });
          }

          await deleteAllPostMedia(id);
          await prisma.postTag.deleteMany({ where: { postId: id } });
          await prisma.post.delete({ where: { id } });
        }
      }

      for (const path of pathsToRevalidate) {
        revalidatePath(path);
      }

      return NextResponse.json({
        success: true,
        message: `Đã xóa ${postIds.length} bài viết.`,
      });
    }

    case "moveCategory": {
      const { categoryId } = body;

      await prisma.post.updateMany({
        where: { id: { in: postIds } },
        data: { categoryId: categoryId || null },
      });

      // Lấy category mới để revalidate thêm path mới
      if (categoryId) {
        const newCategory = await prisma.category.findUnique({
          where: { id: categoryId },
          select: { slug: true },
        });

        if (newCategory?.slug) {
          pathsToRevalidate.add(`/category/${newCategory.slug}`);
        }
      }

      for (const path of pathsToRevalidate) {
        revalidatePath(path);
      }

      return NextResponse.json({
        success: true,
        message: `Đã chuyển danh mục cho ${postIds.length} bài viết.`,
      });
    }

    default:
      return NextResponse.json(
        { error: "Thao tác không hợp lệ." },
        { status: 400 },
      );
  }
}
