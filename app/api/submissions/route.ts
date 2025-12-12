import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  // можно вернуть все отправки
  return NextResponse.json({ submissions: "not implemented list" });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { assignmentId, studentId, fileUrl } = body || {};
  if (!assignmentId || !studentId || !fileUrl) {
    return NextResponse.json({ error: "assignmentId, studentId и fileUrl обязательны" }, { status: 400 });
  }
  const s = store.createSubmission({ assignmentId, studentId, fileUrl });
  return NextResponse.json(s, { status: 201 });
}
