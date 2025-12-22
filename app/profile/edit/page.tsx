import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '../profile-form';

type StudentRow = {
  inn: number;
  Name: string;
  Last_Name: string;
  Middle_Name: string | null;
};

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="mx-auto mt-16 flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-white/15 bg-white/5 p-8 text-center text-slate-100">
        <Sparkles size={28} className="text-indigo-300" />
        <h2 className="text-2xl font-semibold text-white">Нужно войти в аккаунт</h2>
        <p className="text-sm text-slate-400">
          Войдите, чтобы редактировать профиль.
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

  const [
    { data: studentRowRaw },
    { data: teacherRow },
    { data: superadminRow },
  ] = await Promise.all([
    supabase
      .from('students')
      .select('inn,Name,Last_Name,Middle_Name')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase.from('teachers').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('superadmins').select('user_id').eq('user_id', user.id).maybeSingle(),
  ]);

  const studentRow = studentRowRaw as StudentRow | null;

  if (teacherRow || superadminRow) {
    return (
      <section className="mx-auto mt-16 flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-white/15 bg-white/5 p-8 text-center text-slate-100">
        <Sparkles size={28} className="text-indigo-300" />
        <h2 className="text-2xl font-semibold text-white">Редактирование профиля</h2>
        <p className="text-sm text-slate-400">
          Сейчас эта форма предназначена для студентов (таблица <span className="font-mono">students</span>). Для преподавателей/админов можно сделать отдельную форму позже.
        </p>
        <Link
          href="/profile"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          Вернуться в профиль
          <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  if (!studentRow) {
    redirect('/profile/onboarding');
  }

  const metadataInn = user.user_metadata?.student_inn;

  const initial = {
    inn: studentRow?.inn ? String(studentRow.inn) : metadataInn ? String(metadataInn) : '',
    firstName: studentRow?.Name ?? '',
    lastName: studentRow?.Last_Name ?? '',
    middleName: studentRow?.Middle_Name ?? '',
    groupName: user.user_metadata?.group_name ?? '',
    city: user.user_metadata?.city ?? '',
    courseName: user.user_metadata?.course_name ?? '',
  };

  return (
    <div className="space-y-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200"
      >
        <ArrowLeft size={16} />
        Назад в профиль
      </Link>
      <ProfileForm initialData={initial} />
    </div>
  );
}
