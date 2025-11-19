import { Activity, CalendarDays, Wifi } from 'lucide-react';

const quickStats = [
  { label: 'Активные курсы', value: '6', meta: '+2 за неделю' },
  { label: 'Фокус сегодня', value: '4 задачи', meta: '120 минут deep work' },
  { label: 'Средний прогресс', value: '78%', meta: 'данные Supabase' },
];

export default function Header() {
  const today = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-white/10 bg-slate-950/85 px-6 py-4 backdrop-blur">
      <div className="flex flex-col gap-2 text-white">
        <div className="flex justify-between items-center gap-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-violet-300 select-none">
            <CalendarDays size={14} />  {today}
          </p>
          <div
            className="
              inline-flex items-center gap-2 rounded-full border border-emerald-400/40
              bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-100 select-none
              ">
            Service online
          </div>
        </div>
        <p className="max-w-3xl text-sm text-slate-400">
          Личный дашборд студента: оценки, расписание и заметки обновляются в реальном времени, так
          что можно учиться из любого места.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {quickStats.map(stat => (
          <article
            key={stat.label}
            className="min-w-[150px] flex-1 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
            <strong className="mt-1 block text-lg text-white">{stat.value}</strong>
            <div className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
              <Activity size={14} />
              {stat.meta}
            </div>
          </article>
        ))}
      </div>
    </header>
  );
}
