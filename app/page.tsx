import Link from 'next/link';
import { ArrowRight, Clock3, PlayCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Card from './components/Card';

export const revalidate = 0;

type LearningTrack = {
  id: string;
  title: string;
  description: string;
  progress: number;
  updatedAt: string;
  highlight?: string;
};

type UpcomingSession = {
  id: string;
  title: string;
  mentor: string;
  start: string;
  location: string;
  focus?: string;
};

async function fetchDashboardData(): Promise<{
  tracks: LearningTrack[];
  sessions: UpcomingSession[];
}> {
  try {
    const supabase = await createClient();

    const [
      { data: tracksData, error: tracksError },
      { data: sessionsData, error: sessionsError },
    ] = await Promise.all([
      supabase
        .from('learning_tracks')
        .select('id,title,description,progress,updated_at,highlight')
        .order('updated_at', { ascending: false })
        .limit(6),
      supabase
        .from('upcoming_sessions')
        .select('id,title,mentor,start_at,location,focus')
        .order('start_at', { ascending: true })
        .limit(6),
    ]);

    if (tracksError) throw tracksError;
    if (sessionsError) throw sessionsError;

    const tracks =
      tracksData?.map(track => ({
        id: String(track.id),
        title: track.title ?? 'Название предмета',
        description: track.description ?? 'Описание появится позже.',
        progress: Math.round(track.progress ?? 0),
        updatedAt: track.updated_at
          ? new Intl.DateTimeFormat('ru-RU', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(track.updated_at))
          : 'Обновление ожидается',
        highlight: track.highlight ?? undefined,
      })) ?? [];

    const sessions =
      sessionsData?.map(session => ({
        id: String(session.id),
        title: session.title ?? 'Занятие',
        mentor: session.mentor ?? 'Наставник уточняется',
        start: session.start_at
          ? new Intl.DateTimeFormat('ru-RU', {
              weekday: 'long',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(session.start_at))
          : 'Дата согласуется',
        location: session.location ?? 'Площадка уточняется',
        focus: session.focus ?? undefined,
      })) ?? [];

    return { tracks, sessions };
  } catch (error) {
    console.error('Не удалось получить данные Supabase', error);
    return { tracks: [], sessions: [] };
  }
}

export default async function HomePage() {
  const { tracks, sessions } = await fetchDashboardData();

  const averageProgress =
    tracks.length > 0
      ? Math.round(tracks.reduce((sum, track) => sum + track.progress, 0) / tracks.length)
      : 0;

  const nextSession = sessions[0];

  const heroStats = [
    { label: 'Средний прогресс', value: `${averageProgress}%`, meta: 'по активным курсам' },
    {
      label: 'Следующее занятие',
      value: nextSession?.start ?? '—',
      meta: nextSession?.title ?? 'Запланируйте событие',
    },
    { label: 'Конспектов', value: '12', meta: 'доступны офлайн' },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 rounded-[32px] border border-white/15 bg-white/5 p-8 shadow-2xl lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4 text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
            Командный образовательный поток
          </p>
          <h2 className="text-3xl font-semibold">
            Учись гибко, получай аналитику и держи все данные в одном месте.
          </h2>
          <span className="block text-sm text-slate-300">
            Поддерживаем Supabase Auth, таблицы прогресса и любые кастомные источники данных.
            Запускайте платформу на Vercel без долгой подготовки.
          </span>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/protected"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
            >
              Начать спринт
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/grades"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white"
            >
              Смотреть аналитику
            </Link>
          </div>
        </div>

        <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
          {heroStats.map(stat => (
            <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </span>
              <strong className="mt-2 block text-2xl text-white">{stat.value}</strong>
              <p className="text-sm text-slate-400">{stat.meta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">Прогресс по курсам</h3>
            <span className="text-sm text-slate-400">
              Данные подтягиваются из таблицы learning_tracks
            </span>
          </div>
        </div>
        {tracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-slate-400">
            Нет данных в Supabase. Добавьте записи в таблицу learning_tracks.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tracks.map(track => (
              <Card
                key={track.id}
                eyebrow={track.highlight ?? 'Курс'}
                title={track.title}
                description={track.description}
                percent={track.progress}
                footer={track.updatedAt}
                highlight={
                  track.highlight ?? (track.progress >= 80 ? 'Высокий приоритет' : 'В работе')
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">Ближайшие занятия</h3>
            <span className="text-sm text-slate-400">
              Планируйте недели вперёд и держите группу в одном темпе.
            </span>
          </div>
        </div>
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-slate-400">
            Расписание пустое. Заполните таблицу upcoming_sessions в Supabase.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map(session => (
              <article
                key={session.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-white"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  <PlayCircle size={16} />
                  {session.focus ?? 'Live'}
                </div>
                <h4 className="mt-3 text-lg font-semibold">{session.title}</h4>
                <p className="text-sm text-slate-400">{session.mentor}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={16} />
                    {session.start}
                  </span>
                  <span>{session.location}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
