import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '../profile-form';

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return (
      <section className="mx-auto mt-16 flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-white/15 bg-white/5 p-8 text-center text-slate-100">
        <Sparkles size={28} className="text-indigo-300" />
        <h2 className="text-2xl font-semibold text-white">Войдите, чтобы изменить профиль</h2>
        <p className="text-sm text-slate-400">
          Вы можете редактировать данные только после авторизации в JKFish Academy.
        </p>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white"
        >
          Перейти к входу
          <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const studentInn = user.user_metadata?.student_inn;

  const { data: studentRow } = studentInn
    ? await supabase
        .from('students')
        .select('INN,Name,Last_Name,Middle_Name')
        .eq('INN', studentInn)
        .maybeSingle()
    : { data: null };

  const initial = {
    inn: studentInn ? String(studentInn) : '',
    firstName: studentRow?.Name ?? '',
    lastName: studentRow?.Last_Name ?? '',
    middleName: studentRow?.Middle_Name ?? '',
    groupName: user.user_metadata?.group_name ?? '',
    city: user.user_metadata?.city ?? '',
    courseName: user.user_metadata?.course_name ?? 'Вычислительная техника и программное обеспечение',
  };

  return (
    <div className="space-y-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200"
      >
        <ArrowLeft size={16} />
        Назад к профилю
      </Link>
      <ProfileForm initialData={initial} />
    </div>
  );
}
