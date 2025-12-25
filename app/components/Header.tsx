import { Activity, CalendarDays, Wifi } from 'lucide-react';

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
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
            <CalendarDays size={14} />  {today}
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-100">
            Service online
            <Wifi size={12} />
          </div>
        </div>
      </div>
    </header>
  );
}
