import { Clock3, MapPin } from 'lucide-react';

const weekSchedule = [
  {
    day: 'Понедельник',
    sessions: [
      {
        time: '09:00',
        subject: 'Алгоритмы · лайв-решения',
        type: 'Лекция',
        location: 'Кампус · Аудитория C1',
      },
      {
        time: '13:00',
        subject: 'Проектное окно',
        type: 'Фокус',
        location: 'Miro board',
      },
    ],
  },
  {
    day: 'Вторник',
    sessions: [
      {
        time: '11:00',
        subject: 'Математический практикум',
        type: 'Семинар',
        location: 'Zoom · Поток S',
      },
    ],
  },
  {
    day: 'Среда',
    sessions: [
      { time: '10:30', subject: 'Product review', type: 'Sync', location: 'Notion doc' },
      {
        time: '15:00',
        subject: 'Supabase Edge Functions',
        type: 'Workshop',
        location: 'Online lab',
      },
    ],
  },
];

const focusBlocks = [
  { title: 'Deep Work', time: '14:50', duration: '120 мин', description: 'Работа над финальным проектом.', location: 'Кампус · Аудитория А12' },
  { title: 'Mentor Hours', time: '9:20', duration: '45 мин', description: 'Слот для вопросов по коду.', location: 'Кампус · Аудитория А12' },
];

export default function SchedulePage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Ваш темп обучения</p>
          <h2 className="mt-2 text-3xl font-semibold">
            Гибкое расписание, синхронизированное с Supabase.
          </h2>
        </div>
        <button
          type="button"
          className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
        >
          Добавить событие
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {weekSchedule.map(day => (
          <article key={day.day} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-lg font-semibold text-white">{day.day}</h3>
            <ul className="mt-4 space-y-3">
              {day.sessions.map(session => (
                <li
                  key={`${day.day}-${session.time}`}
                  className="rounded-2xl border border-white/5 bg-white/5 p-3"
                >
                  <div className="justify-between text-sm text-slate-400 inline-flex w-full">
                    <div className='flex w-full items-center'><Clock3 size={16} className='mr-1'/>{session.time}</div>
                  <span className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-100">
                    {session.type}
                  </span></div>
                  <strong className="flex text-white w-full">{session.subject}</strong>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400">
                    {session.location}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {focusBlocks.map(block => (
          <div
            key={block.title}
            className="flex items-center justify-between rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-white"
          >
            <div>
              <p className="text-sm text-emerald-200">{block.duration}</p>
              <h4 className="text-xl font-semibold">{block.title}</h4>
              <div className="inline-flex items-center gap-2 text-sm text-emerald-100">
                <MapPin size={16} />
                {block.location}
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400">
              {block.description}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
