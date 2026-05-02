export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import bcrypt from "bcryptjs";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Chỉ admin mới có quyền chỉnh sửa." },
      { status: 403 },
    );
  }

  const body = await req.json();

  const { name, role, bio, active, password, avatar } = body;

  const data: any = {};

  if (name?.trim()) {
    data.name = name.trim();

    const slug = slugify(name);
    let finalSlug = slug;
    let i = 1;

    while (
      await prisma.user.findFirst({
        where: {
          slug: finalSlug,
          NOT: { id: params.id },
        },
      })
    ) {
      finalSlug = `${slug}-${i}`;
      i++;
    }

    data.slug = finalSlug;
  }

  if (role) data.role = role;

  if (bio !== undefined) {
    data.bio = bio?.trim() || null;
  }

  if (avatar !== undefined) {
    data.avatar = avatar?.trim() || null;
  }

  if (active !== undefined) {
    data.active = active;
  }

  if (password?.trim()) {
    data.password = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      slug: true,
      role: true,
      active: true,
      avatar: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Chỉ admin mới có quyền xóa." },
      { status: 403 },
    );
  }

  const postCount = await prisma.post.count({ where: { authorId: params.id } });
  if (postCount > 0) {
    return NextResponse.json(
      { error: `Không thể xóa. Tác giả đang có ${postCount} bài viết.` },
      { status: 400 },
    );
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
