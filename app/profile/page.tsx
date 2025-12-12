import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Mail, MapPin, IdCard, Phone, GraduationCap, Shield } from "lucide-react";

type StudentRow = {
  INN: number;
  Name: string;
  Last_Name: string;
  Middle_Name: string | null;
  group_name?: string | null;
  city?: string | null;
  course_name?: string | null;
  user_id?: string | null;
};

type TeacherRow = {
  first_name: string;
  last_name: string;
  middle_name: string | null;
  user_id: string | null;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return (
      <section className="mx-auto mt-16 flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-white/15 bg-white/5 p-8 text-center text-slate-100">
        <GraduationCap size={28} className="text-indigo-300" />
        <h2 className="text-2xl font-semibold text-white">Войдите, чтобы увидеть профиль</h2>
        <p className="text-sm text-slate-400">
          Профиль доступен только авторизованным пользователям JKFish Academy. Войдите, чтобы продолжить.
        </p>
        <Link
          href="/auth/login"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white"
        >
          Войти
          <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const { data: studentRow } = await supabase
    .from("students")
    .select("INN, Name, Last_Name, Middle_Name, group_name, city, course_name, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: teacherRow } = await supabase
    .from("teachers")
    .select("first_name,last_name,middle_name,user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const isTeacher = Boolean(teacherRow);
  const isStudent = Boolean(studentRow);

  const displayName =
    (teacherRow &&
      [teacherRow.last_name, teacherRow.first_name, teacherRow.middle_name].filter(Boolean).join(" ")) ||
    (studentRow && [studentRow.Last_Name, studentRow.Name, studentRow.Middle_Name].filter(Boolean).join(" ")) ||
    user.user_metadata?.full_name ||
    "Пользователь";

  const roleLabel = isTeacher ? "Преподаватель" : isStudent ? "Студент" : "Пользователь";
  const inn = studentRow?.INN ? String(studentRow.INN) : "—";
  const groupName = studentRow?.group_name || "—";
  const courseName = studentRow?.course_name || "—";
  const city = studentRow?.city || user.user_metadata?.city || "—";
  const email = user.email || "—";
  const phone = user.user_metadata?.phone || "—";

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Профиль</p>
          <h1 className="text-4xl font-semibold text-white">{displayName}</h1>
          <div className="flex gap-3">
            <div className="w-max self-center">
              {isTeacher ? <Shield className="text-emerald-200" size={26} /> : <IdCard className="text-slate-200" size={26} />}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full py-1 text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">
                {roleLabel}
              </div>
              <div className="text-slate-300">Курс: {courseName}</div>
              <div className="text-slate-300">Группа: {groupName}</div>
            </div>
          </div>

          {isStudent && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-4 py-2 text-sm text-slate-100">
              <IdCard size={16} />
              ИНН: {inn}
            </div>
          )}

          <div className="w-full">
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Редактировать профиль
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid min-w-fit max-w-80 flex-1 grid-rows-1 gap-3 text-sm text-slate-100 sm:grid-rows-3">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Mail size={16} />
            {email}
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Phone size={16} />
            {phone}
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <MapPin size={16} />
            {city}
          </div>
        </div>
      </section>
    </div>
  );
}
