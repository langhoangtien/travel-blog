export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // For single-part uploads, the media record is already created in the presign step
    // This endpoint confirms the upload completed successfully
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Upload complete error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
