import { redirect } from "next/navigation";

import { Placeholder } from "@/app/teacher/components/Placeholder";
import { createClient } from "@/lib/supabase/server";

async function requireTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: teacherRow }, { data: superRow }] = await Promise.all([
    supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle(),
    supabase.from("superadmins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!teacherRow && !superRow) redirect("/");
}

export default async function TeacherNotesPage() {
  await requireTeacher();

  return (
    <Placeholder
      title="Заметки преподавателя"
      description="Личные и групповые заметки: сохраняйте идеи к занятиям, списки вопросов и ссылки на материалы."
      hints={[
        "Создание заметок по курсу и по конкретной группе.",
        "Теги и быстрый поиск по заметкам.",
        "Прикрепление файлов и ссылок на материалы.",
      ]}
      actions={[
        { href: "/teacher/tasks", label: "К заданиям" },
        { href: "/teacher/profile", label: "В профиль" },
      ]}
    />
  );
}
