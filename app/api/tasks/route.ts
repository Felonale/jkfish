import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store.getAssignments());
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, deadline } = body || {};
  if (!title || !description) {
    return NextResponse.json({ error: "title и description обязательны" }, { status: 400 });
  }
  const a = store.createAssignment({ title, description, deadline });
  return NextResponse.json(a, { status: 201 });
}
