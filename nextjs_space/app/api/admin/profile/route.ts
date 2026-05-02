export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { name, bio, avatar, currentPassword, newPassword } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Tên không được để trống." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Không tìm thấy người dùng." },
      { status: 404 },
    );
  }

  const data: any = {
    name: name.trim(),
    bio: bio?.trim() || null,
    avatar: avatar?.trim() || null,
  };

  const baseSlug = slugify(name);
  let finalSlug = baseSlug;
  let i = 1;

  while (
    await prisma.user.findFirst({
      where: {
        slug: finalSlug,
        NOT: { id: userId },
      },
    })
  ) {
    finalSlug = `${baseSlug}-${i}`;
    i++;
  }

  data.slug = finalSlug;

  if (newPassword?.trim()) {
    if (!currentPassword?.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu hiện tại." },
        { status: 400 },
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.password);

    if (!valid) {
      return NextResponse.json(
        { error: "Mật khẩu hiện tại không đúng." },
        { status: 400 },
      );
    }

    data.password = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      slug: true,
      bio: true,
      avatar: true,
      role: true,
      active: true,
    },
  });

  return NextResponse.json(updated);
}
