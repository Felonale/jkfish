import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // только суперадмин
  const { data: superRow } = await supabase
    .from("superadmins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!superRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const name = (body?.name ?? "").trim();
  const speciality = (body?.speciality ?? "").trim();
  if (!name) return NextResponse.json({ error: "Название группы обязательно" }, { status: 400 });

  const { error } = await supabase
    .from("study_groups")
    .insert({ name, speciality: speciality || null });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
