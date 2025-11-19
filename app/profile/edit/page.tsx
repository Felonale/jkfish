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

  const profile = {
    name: user.user_metadata?.full_name ?? 'Безымянный студент',
    cohort: user.user_metadata?.cohort ?? 'Cohort · 2025',
    track: user.user_metadata?.track ?? 'Fullstack + Data',
    location: user.user_metadata?.location ?? 'Алматы · гибрид',
    phone: user.user_metadata?.phone ?? '+7 (700) 000-00-00',
    email: user.email ?? '',
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
      <ProfileForm
        initialData={{
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          cohort: profile.cohort,
          track: profile.track,
        }}
      />
    </div>
  );
}
