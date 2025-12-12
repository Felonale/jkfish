import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const detail = store.getAssignmentDetail(params.id);
  if (!detail.assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
