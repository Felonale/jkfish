import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Card from '../components/Card';

const gradeGroups = [
  {
    id: 'math',
    subject: 'Математика для инженеров',
    grade: 'A',
    percent: 92,
    description: '12/14 модулей закрыты, впереди индивидуальный проект.',
    updated: 'Обновлено 40 минут назад',
  },
  {
    id: 'physics',
    subject: 'Физика и моделирование',
    grade: 'B+',
    percent: 84,
    description: 'Новые лабораторные подтянуты в Supabase storage.',
    updated: 'Сегодня · 10:05',
  },
  {
    id: 'programming',
    subject: 'Fullstack-разработка',
    grade: 'A-',
    percent: 88,
    description: 'Проект на Next.js + Drizzle уходит в code review.',
    updated: 'Вчера · 22:18',
  },
];

const breakdownRows = [
  { title: 'Алгоритмический практикум', weight: '30%', status: 'Сдано', score: '94/100', due: '02 дек' },
  {
    title: 'Lab · Supabase Edge Functions',
    weight: '20%',
    status: 'В процессе',
    score: '—',
    due: '05 дек',
  },
  {
    title: 'Design critique · новая панель',
    weight: '15%',
    status: 'Назначено',
    score: '—',
    due: '07 дек',
  },
  { title: 'Итоговый коллоквиум', weight: '35%', status: 'Готов к записи', score: '—', due: '15 дек' },
];

export default function GradesPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Панель успеваемости</p>
          <h2 className="mt-2 text-3xl font-semibold">
            Отслеживайте качество обучения и не теряйте дедлайны.
          </h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
          >
            Синхронизировать Supabase
          </button>
          <Link
            href="/notes"
            className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white"
          >
            Экспорт отчёта
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gradeGroups.map(group => (
          <Link
            key={group.id}
            href={`/grades/${group.id}`}
            className="block rounded-3xl border border-transparent transition hover:-translate-y-1 hover:border-white/20"
          >
            <Card
              eyebrow={`Текущая оценка: ${group.grade}`}
              title={group.subject}
              description={group.description}
              percent={group.percent}
              footer={group.updated}
              highlight={group.percent > 90 ? "Dean's list" : 'В работе'}
            />
          </Link>
        ))}
      </div>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold">Детализация заданий</h3>
            <span className="text-sm text-slate-400">Данные подгружаются из таблицы grades_breakdown</span>
          </div>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200"
          >
            Добавить заметку
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
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
              {breakdownRows.map(row => (
                <tr key={row.title} className="odd:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{row.title}</td>
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
        </div>
      </section>
    </div>
  );
}
