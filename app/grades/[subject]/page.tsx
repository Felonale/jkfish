import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, BadgeCheck, BookOpen, Gauge, TrendingUp } from 'lucide-react';
import { p } from 'framer-motion/client';

type GradeOverview = {
  id: string;
  title: string;
  description: string;
  grade: string;
  percent: number;
  credits: number;
  updatedAt: string;
};

type BreakdownRow = {
  id: string;
  title: string;
  weight: string;
  status: string;
  score: string;
  due: string;
};

const fallback: Record<string, GradeOverview> = {
  math: {
    id: 'math',
    title: 'Математика для инженеров',
    description: 'Сложные доказательства, задачи и моделирование.',
    grade: 'A',
    percent: 92,
    credits: 5,
    updatedAt: '01 февраля, 10:00',
  },
  physics: {
    id: 'physics',
    title: 'Физика и моделирование',
    description: 'Лабы, симуляции и командные мини-проекты.',
    grade: 'B+',
    percent: 84,
    credits: 4,
    updatedAt: '31 января, 18:40',
  },
  programming: {
    id: 'programming',
    title: 'Fullstack-разработка',
    description: 'Проект на Next.js + Drizzle уходит в code review.',
    grade: 'A-',
    percent: 88,
    credits: 6,
    updatedAt: '3 декабрья, 20:15',
  },
  'operating-systems': {
    id: 'operating-systems',
    title: 'Операционные системы',
    description: 'Сделать на виндовс несколько директорий и присвоить им разные статусы разрешения.',
    grade: 'B-',
    percent: 85,
    credits: 5,
    updatedAt: '30 января, 20:15',
  },
};

async function fetchSubject(subject: string): Promise<GradeOverview | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('learning_tracks')
      .select('id,title,description,progress,updated_at,highlight')
      .eq('id', subject)
      .single();

    if (error || !data) {
      return fallback[subject] ?? null;
    }

    return {
      id: data.id,
      title: data.title ?? 'Курс',
      description: data.description ?? 'Описание появится позже.',
      grade: data.highlight ?? 'A-',
      percent: Math.round(data.progress ?? 0),
      credits: 5,
      updatedAt: data.updated_at
        ? new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(data.updated_at))
        : 'Дата уточняется',
    };
  } catch (error) {
    console.error('Не удалось получить данные предмета', error);
    return fallback[subject] ?? null;
  }
}

const sampleBreakdown: BreakdownRow[] = [
  {
    id: 'task-1',
    title: 'Контрольная · алгоритмы',
    weight: '20%',
    status: 'Сдано',
    score: '95/100',
    due: '12 янв',
  },
  {
    id: 'task-2',
    title: 'Lab: Supabase Edge',
    weight: '15%',
    status: 'В процессе',
    score: '—',
    due: '05 фев',
  },
  {
    id: 'task-3',
    title: 'Кейсовое интервью',
    weight: '25%',
    status: 'Запланировано',
    score: '—',
    due: '09 фев',
  },
  {
    id: 'task-4',
    title: 'Финальный коллоквиум',
    weight: '40%',
    status: 'Готов к записи',
    score: '—',
    due: '18 фев',
  },
];

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const overview = await fetchSubject(subject);

  if (!overview) {
    return notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href="/grades"
        className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200"
      >
        <ArrowLeft size={16} />
        Назад к курсам
      </Link>

      <section className="flex flex-wrap justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
            Предмет
          </span>
          <h1 className="text-4xl font-semibold">{overview.title}</h1>
          <p className="text-slate-300">{overview.description}</p>
        </div>
        <div className="space-y-2 text-sm text-slate-200">
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} />
            Итоговая оценка: {overview.grade}
          </div>
          <div className="flex items-center gap-2">
            <Gauge size={16} />
            Прогресс: {overview.percent}%
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={16} />
            Кредиты: {overview.credits}
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            Обновлено: {overview.updatedAt}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-white">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Итоговая оценка</span>
          <strong className="mt-2 block text-3xl">{overview.grade}</strong>
        </article>
        <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-white">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Процент выполнения</span>
          <strong className="mt-2 block text-3xl">{overview.percent}%</strong>
        </article>
        <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-white">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Кредиты курса</span>
          <strong className="mt-2 block text-3xl">{overview.credits}</strong>
        </article>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10">
        <table className="w-full border-collapse text-left text-sm text-slate-100">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
            <tr>
              <th className="px-4 py-3">Задание</th>
              <th className="px-4 py-3">Вес</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Оценка</th>
              <th className="px-4 py-3">Дедлайн</th>
            </tr>
          </thead>
          <tbody>
            {sampleBreakdown.map(row => (
              <tr key={row.id} className="odd:bg-white/5">
                <td className="px-4 py-3 font-semibold text-white">{row.title}</td>
                <td className="px-4 py-3 text-slate-300">{row.weight}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{row.score}</td>
                <td className="px-4 py-3 text-slate-300">{row.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
