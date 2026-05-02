export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Bitte geben Sie eine g\u00FCltige E-Mail-Adresse ein." }, { status: 400 });
    }
    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      if (!existing.active) {
        await prisma.newsletter.update({ where: { email }, data: { active: true } });
      }
      return NextResponse.json({ message: "Erfolgreich angemeldet!" });
    }
    await prisma.newsletter.create({ data: { email, name: name || null } });
    return NextResponse.json({ message: "Erfolgreich angemeldet!" });
  } catch (err: any) {
    console.error("Newsletter error:", err);
    return NextResponse.json({ error: "Fehler bei der Anmeldung." }, { status: 500 });
  }
}
