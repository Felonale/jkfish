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

export default async function TeacherSchedulePage() {
  await requireTeacher();

  return (
    <Placeholder
      title="Расписание преподавателя"
      description="В этом разделе появятся ваши пары, консультации и экзамены. Мы подтянем их из базы и дадим быстрый контроль статусов."
      hints={[
        "Покажем ближайшие занятия и занятия на неделю.",
        "Дадим отмечать статус занятия (проведено, перенесено, отменено).",
        "Добавим сводку посещаемости групп.",
      ]}
      actions={[
        { href: "/teacher/tasks", label: "Перейти к заданиям" },
        { href: "/teacher/grades", label: "Смотреть ведомости" },
      ]}
    />
  );
}
