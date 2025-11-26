import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowRight,
  Activity,
  CalendarClock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  IdCard,
} from 'lucide-react';

const globalStats = [
  { label: 'Средний балл', value: '85', meta: 'за всё время' },
  { label: 'Выполнено сегодня', value: '4 задачи', meta: '157 минут фокуса' },
];

const achievements = [
  { label: 'Средний балл', value: '79', meta: 'за текущую неделю' },
  { label: 'Посещаемость', value: '80%', meta: 'за текущую неделю' },
  { label: 'Открытые задания', value: '3', meta: '' },
];

const timeline = [
  { title: 'Capstone: цифровой кампус', due: '05 фев · demo day', status: 'В разработке' },
  { title: 'Edge Functions workshop', due: '08 фев · 11:00', status: 'Запланировано' },
  { title: 'Mentor one-on-one', due: '12 фев · 19:30', status: 'Требует подтверждения' },
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return (
      <section className="mx-auto mt-16 flex max-w-xl flex-col items-center gap-4 rounded-3xl
          border border-white/15 bg-white/5 p-8 text-center text-slate-100">
        <Sparkles size={28} className="text-indigo-300" />
        <h2 className="text-2xl font-semibold text-white">Войдите, чтобы увидеть профиль</h2>
        <p className="text-sm text-slate-400">
          Персональная аналитика доступна только авторизованным студентам JKFish Academy.
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
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Профиль студента</p>
          <h1 className="text-4xl font-semibold text-white">{profile.name}</h1>
          <div className='flex gap-3'>
            <div className='w-max self-center'>
              <IdCard className='text-slate-200' size={26} />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full py-1 text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">
                {profile.cohort}
              </div>
              <div className="text-slate-300">{profile.track}</div>
            </div>
          </div>

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
            {user.email}
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Phone size={16} />
            {profile.phone}
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <MapPin size={16} />
            {profile.location}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {globalStats.map(stat => (
          <article
            key={stat.label}
            className="min-w-[150px] flex-1 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
            <strong className="mt-1 block text-lg text-white">{stat.value}</strong>
            <div className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">{stat.meta}</div>
          </article>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {achievements.map(item => (
          <article
            key={item.label}
            className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-white"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</span>
            <strong className="mt-2 block text-3xl">{item.value}</strong>
            <p className="text-sm text-slate-400">{item.meta}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Ближайшие активности</h2>
            <p className="text-sm text-slate-400">
              План обучения синхронизирован с Supabase расписанием.
            </p>
          </div>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/40 px-4 py-2 text-sm text-violet-100"
          >
            Открыть календарь
            <CalendarClock size={16} />
          </Link>
        </header>

        <ul className="space-y-3">
          {timeline.map(item => (
            <li
              key={item.title}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <span className="text-sm text-slate-400">{item.due}</span>
              </div>
              <p className="text-sm font-semibold text-amber-300">{item.status}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
