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

export default async function TeacherGradesPage() {
  await requireTeacher();

  return (
    <Placeholder
      title="Ведомости и оценки"
      description="Сводка по дисциплинам, группам и студентам. Здесь появится управление оценками и финальными баллами."
      hints={[
        "Фильтр по курсу, группе и периоду.",
        "Редактирование и подтверждение баллов по заданиям.",
        "Экспорт ведомости и комментарии к оценкам.",
      ]}
      actions={[
        { href: "/teacher/tasks", label: "Проверить отправки" },
        { href: "/teacher/schedule", label: "К расписанию" },
      ]}
    />
  );
}
