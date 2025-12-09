'use client';

import { useState } from 'react';
import { Clock3, MapPin, X } from 'lucide-react';

type Session = { time: string; subject: string; type: string; location: string };
type DaySchedule = { day: string; sessions: Session[] };
type Note = { id: number; title: string; description: string; location: string; duration: string };
type EventForm = { day: string; time: string; subject: string; type: string; location: string };
type NoteForm = { title: string; description: string; location: string; duration: string };

const weekOrder = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

const sortByTime = (sessions: Session[]) =>
  [...sessions].sort((a, b) => a.time.localeCompare(b.time));

const emptyEventForm: EventForm = {
  day: 'Понедельник',
  time: '',
  subject: '',
  type: '',
  location: '',
};

const emptyNoteForm: NoteForm = {
  title: '',
  description: '',
  location: '',
  duration: '',
};

type BaseModalProps = {
  title: string;
  onSubmit: () => void;
  onClose: () => void;
  buttonGradient: string;
  children: React.ReactNode;
};

function BaseModal({ title, onSubmit, onClose, buttonGradient, children }: BaseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 text-white">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X size={20} />
        </button>
        <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {children}
          <button
            type="submit"
            className={`mt-4 w-full rounded-2xl ${buttonGradient} px-4 py-2 text-sm font-semibold text-white`}
          >
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}

type EventModalProps = {
  form: EventForm;
  setForm: React.Dispatch<React.SetStateAction<EventForm>>;
  onSubmit: () => void;
  onClose: () => void;
  title: string;
};

function EventModal({ form, setForm, onSubmit, onClose, title }: EventModalProps) {
  const change = (field: keyof EventForm, v: string) => setForm(p => ({ ...p, [field]: v }));

  return (
    <BaseModal title={title} onSubmit={onSubmit} onClose={onClose} buttonGradient="bg-gradient-to-r from-violet-500 to-cyan-400">
      <div>
        <label className="text-sm text-slate-300">День недели</label>
        <select
          value={form.day}
          onChange={e => change('day', e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-700/70 bg-slate-900 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
        >
          {weekOrder.map(day => (
            <option key={day} value={day} className="bg-slate-900 text-slate-100">
              {day}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-slate-300">Время</label>
        <input
          type="time"
          value={form.time}
          onChange={e => change('time', e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Название</label>
        <input
          type="text"
          value={form.subject}
          onChange={e => change('subject', e.target.value)}
          placeholder="Например: Семинар по JS"
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Тип</label>
        <input
          type="text"
          value={form.type}
          onChange={e => change('type', e.target.value)}
          placeholder="Лекция / Семинар / Workshop"
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Локация</label>
        <input
          type="text"
          value={form.location}
          onChange={e => change('location', e.target.value)}
          placeholder="Кампус · Аудитория"
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>
    </BaseModal>
  );
}

type NoteModalProps = {
  form: NoteForm;
  setForm: React.Dispatch<React.SetStateAction<NoteForm>>;
  onSubmit: () => void;
  onClose: () => void;
  title: string;
};

function NoteModal({ form, setForm, onSubmit, onClose, title }: NoteModalProps) {
  const change = (field: keyof NoteForm, v: string) => setForm(p => ({ ...p, [field]: v }));

  return (
    <BaseModal title={title} onSubmit={onSubmit} onClose={onClose} buttonGradient="bg-gradient-to-r from-green-500 to-emerald-400">
      <div>
        <label className="text-sm text-slate-300">Название заметки</label>
        <input
          type="text"
          value={form.title}
          onChange={e => change('title', e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Описание</label>
        <input
          type="text"
          value={form.description}
          onChange={e => change('description', e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Кабинет для сдачи</label>
        <input
          type="text"
          value={form.location}
          onChange={e => change('location', e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Сроки сдачи</label>
        <input
          type="text"
          value={form.duration}
          onChange={e => change('duration', e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>
    </BaseModal>
  );
}

export default function SchedulePage() {
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);
  const [eventForm, setEventForm] = useState<EventForm>(emptyEventForm);
  const [editKey, setEditKey] = useState<{ day: string; time: string; subject: string } | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [noteForm, setNoteForm] = useState<NoteForm>(emptyNoteForm);
  const [noteEditId, setNoteEditId] = useState<number | null>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setEditKey(null);
    setEventForm(emptyEventForm);
  };

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setNoteEditId(null);
    setNoteForm(emptyNoteForm);
  };

  const upsertSession = (targetDay: string, session: Session) => {
    setWeekSchedule(prev => {
      let days = prev.map(d => ({ ...d, sessions: [...d.sessions] }));

      // удалить старую сессию, если редактируем
      if (editKey) {
        days = days
          .map(d =>
            d.day === editKey.day
              ? {
                  ...d,
                  sessions: d.sessions.filter(
                    s => !(s.time === editKey.time && s.subject === editKey.subject),
                  ),
                }
              : d,
          )
          .filter(d => d.sessions.length > 0);
      }

      const idx = days.findIndex(d => d.day === targetDay);
      if (idx === -1) {
        days.push({ day: targetDay, sessions: [session] });
      } else {
        days[idx].sessions = sortByTime([...days[idx].sessions, session]);
      }

      days.sort((a, b) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day));
      return days;
    });
  };

  const handleCreateEvent = () => {
    upsertSession(eventForm.day, {
      time: eventForm.time,
      subject: eventForm.subject,
      type: eventForm.type,
      location: eventForm.location,
    });
    closeEventModal();
  };

  const handleEditEvent = () => {
    if (!editKey) return;
    upsertSession(eventForm.day, {
      time: eventForm.time,
      subject: eventForm.subject,
      type: eventForm.type,
      location: eventForm.location,
    });
    closeEventModal();
  };

  const handleDeleteEvent = (dayName: string, time: string, subject: string) => {
    setWeekSchedule(prev =>
      prev
        .map(d =>
          d.day === dayName
            ? {
                ...d,
                sessions: d.sessions.filter(s => !(s.time === time && s.subject === subject)),
              }
            : d,
        )
        .filter(d => d.sessions.length > 0),
    );
  };

  const openCreateEvent = () => {
    setEditKey(null);
    setEventForm(emptyEventForm);
    setIsEventModalOpen(true);
  };

  const openEditEvent = (day: string, session: Session) => {
    setEditKey({ day, time: session.time, subject: session.subject });
    setEventForm({ day, time: session.time, subject: session.subject, type: session.type, location: session.location });
    setIsEventModalOpen(true);
  };

  const handleCreateNote = () => {
    const note: Note = { id: Date.now(), ...noteForm };
    setNotes(prev => [...prev, note]);
    closeNoteModal();
  };

  const handleEditNote = () => {
    if (noteEditId == null) return;
    setNotes(prev => prev.map(n => (n.id === noteEditId ? { ...n, ...noteForm } : n)));
    closeNoteModal();
  };

  const openCreateNote = () => {
    setNoteEditId(null);
    setNoteForm(emptyNoteForm);
    setIsNoteModalOpen(true);
  };

  const openEditNote = (note: Note) => {
    setNoteEditId(note.id);
    setNoteForm({
      title: note.title,
      description: note.description,
      location: note.location,
      duration: note.duration,
    });
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = (id: number) => setNotes(prev => prev.filter(n => n.id !== id));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Ваш темп обучения</p>
          <h2 className="mt-2 text-3xl font-semibold">Гибкое расписание, синхронизированное с Supabase.</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openCreateEvent}
            className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
          >
            Добавить событие
          </button>
          <button
            onClick={openCreateNote}
            className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-white"
          >
            Добавить заметку
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {weekSchedule.map(day => (
          <article key={day.day} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-lg font-semibold text-white">{day.day}</h3>
            <ul className="mt-4 space-y-3">
              {day.sessions.map(session => (
                <li key={`${day.day}-${session.time}-${session.subject}`} className="rounded-2xl border border-white/5 bg-white/5 p-3">
                  <div className="inline-flex w-full justify-between text-sm text-slate-400">
                    <div className="flex w-full items-center">
                      <Clock3 size={16} className="mr-1" />
                      {session.time}
                    </div>
                    <span className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-100">
                      {session.type}
                    </span>
                  </div>
                  <strong className="flex w-full text-white">{session.subject}</strong>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400">{session.location}</div>
                  <div className="mt-3 flex gap-4 text-xs">
                    <button
                      onClick={() => openEditEvent(day.day, session)}
                      className="text-cyan-300 underline hover:text-cyan-400"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(day.day, session.time, session.subject)}
                      className="text-red-300 underline hover:text-red-400"
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

      {notes.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2">
          {notes.map(note => (
            <div
              key={note.id}
              className="flex items-center justify-between rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-white"
            >
              <div>
                <p className="text-sm text-emerald-200">{note.duration || 'Без длительности'}</p>
                <h4 className="text-xl font-semibold">{note.title}</h4>
                {note.location && (
                  <div className="inline-flex items-center gap-2 text-sm text-emerald-100">
                    <MapPin size={16} />
                    {note.location}
                  </div>
                )}
              </div>
              <div className="mt-2 inline-flex flex-col items-end gap-2 text-sm text-slate-300">
                <div className="max-w-xs text-right">{note.description}</div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => openEditNote(note)}
                    className="text-cyan-300 underline hover:text-cyan-400 text-xs"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-300 underline hover:text-red-400 text-xs"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {isEventModalOpen && (
        <EventModal
          title={editKey ? 'Редактировать событие' : 'Добавить событие'}
          form={eventForm}
          setForm={setEventForm}
          onSubmit={editKey ? handleEditEvent : handleCreateEvent}
          onClose={closeEventModal}
        />
      )}

      {isNoteModalOpen && (
        <NoteModal
          title={noteEditId != null ? 'Редактировать заметку' : 'Добавить заметку'}
          form={noteForm}
          setForm={setNoteForm}
          onSubmit={noteEditId != null ? handleEditNote : handleCreateNote}
          onClose={closeNoteModal}
        />
      )}
    </div>
  );
}
