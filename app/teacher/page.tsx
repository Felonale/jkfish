import Link from "next/link";
import { redirect } from "next/navigation";

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

export default async function TeacherHomePage() {
  await requireTeacher();

  const quickLinks = [
    {
      href: "/teacher/tasks",
      title: "Задания и проверки",
      description: "Создавайте задания, смотрите отправки и выставляйте оценки.",
    },
    {
      href: "/teacher/schedule",
      title: "Расписание",
      description: "Предстоящие пары и сессии по вашим курсам.",
    },
    {
      href: "/teacher/grades",
      title: "Ведомости",
      description: "Оценки по группам и дисциплинам, финальные баллы.",
    },
    {
      href: "/teacher/notes",
      title: "Заметки преподавателя",
      description: "Личные пометки по группам, темам и задачам.",
    },
    {
      href: "/teacher/profile",
      title: "Профиль",
      description: "Данные преподавателя, доступы и роли.",
    },
  ];

  return (
    <div className="space-y-8 text-white">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-800 p-8 shadow-2xl shadow-black/40">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-200/80">Кабинет преподавателя</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Добро пожаловать! Управляйте курсами в одном месте.
            </h1>
            <p className="text-slate-200">
              Здесь собраны ваши задания, пары, ведомости и заметки. Быстрые ссылки ниже помогут сразу перейти к нужному
              разделу.
            </p>
          </div>
          <Link
            href="/teacher/tasks"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/20"
          >
            Перейти к заданиям
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group block h-full rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Раздел</p>
            <h2 className="mt-2 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{item.description}</p>
            <span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
              Открыть →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
