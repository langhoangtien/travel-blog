export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Tên tag không được để trống." }, { status: 400 });

  const slug = slugify(name);
  const exists = await prisma.tag.findUnique({ where: { slug } });
  if (exists) return NextResponse.json(exists);

  const tag = await prisma.tag.create({ data: { name: name.trim(), slug } });
  return NextResponse.json(tag, { status: 201 });
}
