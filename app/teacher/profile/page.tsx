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
    supabase.from("teachers").select("first_name,last_name,middle_name").eq("user_id", user.id).maybeSingle(),
    supabase.from("superadmins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!teacherRow && !superRow) redirect("/");
  return { teacherRow };
}

export default async function TeacherProfilePage() {
  const { teacherRow } = await requireTeacher();

  const fullName =
    teacherRow && [teacherRow.last_name, teacherRow.first_name, teacherRow.middle_name].filter(Boolean).join(" ");

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-800 p-6 shadow-xl shadow-black/30">
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/80">Профиль</p>
        <h1 className="mt-2 text-3xl font-semibold">Данные преподавателя</h1>
        <p className="mt-2 text-slate-200">{fullName || "Имя не заполнено"}</p>
        <p className="mt-4 text-sm text-slate-300">
          Здесь появится возможность обновлять контактные данные, закреплять курсы и управлять доступами. Если нужно
          изменить информацию сейчас — напишите администратору.
        </p>
      </div>

      <Placeholder
        title="Редактирование профиля"
        description="Скоро добавим полноценную форму: контакты, академическая должность, закрепленные дисциплины и расписание консультаций."
        hints={[
          "Редактирование ФИО, почты и телефона.",
          "Привязка к курсам и группам.",
          "Настройка видимости для студентов.",
        ]}
        actions={[{ href: "/teacher/tasks", label: "К заданиям" }]}
      />
    </div>
  );
}
