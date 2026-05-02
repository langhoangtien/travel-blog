export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Tên danh mục không được để trống." }, { status: 400 });

  const slug = slugify(name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "Danh mục đã tồn tại." }, { status: 400 });

  const category = await prisma.category.create({ data: { name: name.trim(), slug, description: description?.trim() || null } });
  return NextResponse.json(category, { status: 201 });
}
