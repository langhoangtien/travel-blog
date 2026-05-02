import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body || {};

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Ung\u00fcltige E-Mail-Adresse." }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: "Die Nachricht muss mindestens 10 Zeichen lang sein." }, { status: 400 });
    }

    // Log the contact form submission
    console.log("[Contact Form]", { name, email, subject, message: message.substring(0, 100) });

    return NextResponse.json({ success: true, message: "Nachricht erfolgreich gesendet." });
  } catch {
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
