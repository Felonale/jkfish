import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const assignmentId = searchParams.get("assignmentId");

  if (studentId && assignmentId) {
    return NextResponse.json(store.getGrade(studentId, assignmentId) ?? null);
  }

  if (assignmentId) {
    return NextResponse.json(store.getGradesByAssignment(assignmentId));
  }

  if (studentId) {
    return NextResponse.json(store.getGrades(studentId));
  }

  return NextResponse.json({ error: "studentId или assignmentId обязателен" }, { status: 400 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { assignmentId, studentId, score, comment } = body || {};
  if (!assignmentId || !studentId || score === undefined) {
    return NextResponse.json({ error: "assignmentId, studentId и score обязательны" }, { status: 400 });
  }
  const g = store.setGrade({ assignmentId, studentId, score, comment });
  return NextResponse.json(g, { status: 201 });
}
