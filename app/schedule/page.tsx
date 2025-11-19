'use client';

import { useState } from 'react';
import { Clock3, MapPin, X } from 'lucide-react';

const weekOrder = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

const initialWeekSchedule = [
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
  {
    title: 'Deep Work',
    time: '14:50',
    duration: '120 мин',
    description: 'Работа над финальным проектом.',
    location: 'Кампус · Аудитория А12',
  },
  {
    title: 'Mentor Hours',
    time: '9:20',
    duration: '45 мин',
    description: 'Слот для вопросов по коду.',
    location: 'Кампус · Аудитория А12',
  },
];

export default function SchedulePage() {
  const [weekSchedule, setWeekSchedule] = useState(initialWeekSchedule);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [form, setForm] = useState({
    day: 'Понедельник',
    time: '',
    subject: '',
    type: '',
    location: '',
  });

  const [editData, setEditData] = useState<any>(null);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const sortByTime = (sessions: any[]) => sessions.sort((a, b) => a.time.localeCompare(b.time));

  const handleAddEvent = () => {
    setWeekSchedule(prev => {
      let updated = [...prev];

      let index = updated.findIndex(d => d.day === form.day);

      if (index === -1) {
        updated.push({
          day: form.day,
          sessions: [],
        });
        index = updated.length - 1;
      }

      updated[index].sessions.push({
        time: form.time,
        subject: form.subject,
        type: form.type,
        location: form.location,
      });

      updated[index].sessions = sortByTime(updated[index].sessions);

      updated.sort((a, b) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day));

      return updated;
    });

    setIsModalOpen(false);
  };

  const handleDeleteEvent = (dayName: string, time: string, subject: string) => {
    setWeekSchedule(prev => {
      let updated = [...prev];

      const dayIndex = updated.findIndex(d => d.day === dayName);
      if (dayIndex === -1) return prev;

      updated[dayIndex].sessions = updated[dayIndex].sessions.filter(
        s => !(s.time === time && s.subject === subject)
      );

      if (updated[dayIndex].sessions.length === 0) updated.splice(dayIndex, 1);

      updated.sort((a, b) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day));

      return updated;
    });
  };

  const handleOpenEdit = (day: string, session: any) => {
    setEditData({ day, ...session });
    setForm({
      day,
      time: session.time,
      subject: session.subject,
      type: session.type,
      location: session.location,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    setWeekSchedule(prev => {
      let updated = [...prev];

      const oldDayIndex = updated.findIndex(d => d.day === editData.day);
      if (oldDayIndex === -1) return prev;

      updated[oldDayIndex].sessions = updated[oldDayIndex].sessions.filter(
        s => !(s.time === editData.time && s.subject === editData.subject)
      );

      if (updated[oldDayIndex].sessions.length === 0)
        updated.splice(oldDayIndex, 1);

      let newDayIndex = updated.findIndex(d => d.day === form.day);
      if (newDayIndex === -1) {
        updated.push({ day: form.day, sessions: [] });
        newDayIndex = updated.length - 1;
      }

      updated[newDayIndex].sessions.push({
        time: form.time,
        subject: form.subject,
        type: form.type,
        location: form.location,
      });

      updated[newDayIndex].sessions = sortByTime(updated[newDayIndex].sessions);

      updated.sort((a, b) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day));

      return updated;
    });

    setIsEditOpen(false);
  };

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
          onClick={() => setIsModalOpen(true)}
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
                  key={`${day.day}-${session.time}-${session.subject}`}
                  className="rounded-2xl border border-white/5 bg-white/5 p-3"
                >
                  <div className="justify-between text-sm text-slate-400 inline-flex w-full">
                    <div className="flex w-full items-center">
                      <Clock3 size={16} className="mr-1" />
                      {session.time}
                    </div>

                    <span className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-100">
                      {session.type}
                    </span>
                  </div>

                  <strong className="flex text-white w-full">{session.subject}</strong>

                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400">
                    {session.location}
                  </div>

                  {/* КНОПКИ */}
                  <div className="mt-3 flex gap-4 text-xs">
                    <button
                      onClick={() => handleOpenEdit(day.day, session)}
                      className="text-cyan-300 hover:text-cyan-400 underline"
                    >
                      Изменить
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteEvent(day.day, session.time, session.subject)
                      }
                      className="text-red-300 hover:text-red-400 underline"
                    >
                      Удалить
                    </button>
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
      {isModalOpen && (
        <Modal
          title="Добавить событие"
          form={form}
          setForm={setForm}
          onSubmit={handleAddEvent}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isEditOpen && (
        <Modal
          title="Редактировать событие"
          form={form}
          setForm={setForm}
          onSubmit={handleSaveEdit}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  );
}

function Modal({ title, form, setForm, onSubmit, onClose }: any) {
  const handleChange = (field: string, value: string) =>
    setForm((prev: any) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 text-white relative">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h3 className="mb-4 text-2xl font-semibold">{title}</h3>

        <div className="space-y-4">
          
          <div>
            <label className="text-sm text-slate-300">День недели</label>
            <select
              value={form.day}
              onChange={e => handleChange('day', e.target.value)}
              className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
            >
              {weekOrder.map(day => (
                <option key={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300">Время</label>
            <input
              type="time"
              value={form.time}
              onChange={e => handleChange('time', e.target.value)}
              className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Название</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => handleChange('subject', e.target.value)}
              placeholder="Например: Семинар по JS"
              className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Тип</label>
            <input
              type="text"
              value={form.type}
              onChange={e => handleChange('type', e.target.value)}
              placeholder="Лекция / Семинар / Workshop"
              className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Локация</label>
            <input
              type="text"
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
              placeholder="Кампус · Аудитория B1"
              className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
            />
          </div>

          <button
            onClick={onSubmit}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white mt-4"
          >
            Сохранить
          </button>

        </div>
      </div>
    </div>
  );
}

