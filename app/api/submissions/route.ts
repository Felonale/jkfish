import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get("assignmentId") ?? undefined;
  const studentId = searchParams.get("studentId") ?? undefined;
  const submissions = store.getSubmissions({ assignmentId, studentId });
  return NextResponse.json(submissions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { assignmentId, studentId, studentName, description, fileUrl, attachments } = body || {};
  if (!assignmentId || !studentId || !fileUrl) {
    return NextResponse.json({ error: "assignmentId, studentId и fileUrl обязательны" }, { status: 400 });
  }
  const s = store.createSubmission({
    assignmentId,
    studentId,
    studentName,
    description,
    fileUrl,
    attachments,
  });
  return NextResponse.json(s, { status: 201 });
}
