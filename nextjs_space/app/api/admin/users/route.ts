export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      slug: true,
      bio: true,
      avatar: true,
      role: true,
      active: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Chỉ admin mới có quyền tạo tài khoản." },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { email, password, name, role, bio, avatar } = body;

  if (!email?.trim() || !password?.trim() || !name?.trim()) {
    return NextResponse.json(
      { error: "Email, mật khẩu và tên không được để trống." },
      { status: 400 },
    );
  }

  const exists = await prisma.user.findUnique({
    where: { email: email.trim() },
  });

  if (exists) {
    return NextResponse.json({ error: "Email đã tồn tại." }, { status: 400 });
  }

  const slug = slugify(name);
  let finalSlug = slug;
  let i = 1;

  while (
    await prisma.user.findUnique({
      where: { slug: finalSlug },
    })
  ) {
    finalSlug = `${slug}-${i}`;
    i++;
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: email.trim(),
      password: hashed,
      name: name.trim(),
      slug: finalSlug,
      role: role || "AUTHOR",
      bio: bio?.trim() || null,
      avatar: avatar?.trim() || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      slug: true,
      avatar: true,
      role: true,
      active: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
