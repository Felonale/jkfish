"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, MapPin, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Session = {
  id: number;
  day: string;
  time: string;
  subject: string;
  type: string;
  location: string;
  courseName?: string;
};

type DaySchedule = { day: string; sessions: Session[] };

type Note = {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
};

type NoteForm = { title: string; description: string; location: string; duration: string };

const weekOrder = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

const sortByTime = (sessions: Session[]) =>
  [...sessions].sort((a, b) => a.time.localeCompare(b.time));

const emptyNoteForm: NoteForm = {
  title: "",
  description: "",
  location: "",
  duration: "",
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
          onSubmit={(e) => {
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

type NoteModalProps = {
  form: NoteForm;
  setForm: React.Dispatch<React.SetStateAction<NoteForm>>;
  onSubmit: () => void;
  onClose: () => void;
  title: string;
};

function NoteModal({ form, setForm, onSubmit, onClose, title }: NoteModalProps) {
  const change = (field: keyof NoteForm, v: string) => setForm((p) => ({ ...p, [field]: v }));

  return (
    <BaseModal
      title={title}
      onSubmit={onSubmit}
      onClose={onClose}
      buttonGradient="bg-gradient-to-r from-green-500 to-emerald-400"
    >
      <div>
        <label className="text-sm text-slate-300">Название заметки</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => change("title", e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Описание</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => change("description", e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Локация</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => change("location", e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Длительность</label>
        <input
          type="text"
          value={form.duration}
          onChange={(e) => change("duration", e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-white"
        />
      </div>
    </BaseModal>
  );
}

const getDayLabel = (date: string) => {
  const d = new Date(date);
  const idx = d.getDay(); // 0=Sun
  const map = [6, 0, 1, 2, 3, 4, 5]; // convert to index in weekOrder
  return weekOrder[map[idx]] ?? weekOrder[0];
};

export default function SchedulePage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteForm, setNoteForm] = useState<NoteForm>(emptyNoteForm);
  const [noteEditId, setNoteEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setNoteEditId(null);
    setNoteForm(emptyNoteForm);
  };

  const groupSessions = (sessions: Session[]) => {
    const byDay = new Map<string, Session[]>();
    sessions.forEach((s) => {
      const arr = byDay.get(s.day) ?? [];
      arr.push(s);
      byDay.set(s.day, arr);
    });
    const result: DaySchedule[] = Array.from(byDay.entries()).map(([day, ses]) => ({
      day,
      sessions: sortByTime(ses),
    }));
    result.sort((a, b) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day));
    return result;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr) {
      setError(userErr.message);
      setLoading(false);
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: teacherRow }, { data: superRow }] = await Promise.all([
      supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle(),
      supabase.from("superadmins").select("user_id").eq("user_id", user.id).maybeSingle(),
    ]);
    if (teacherRow || superRow) {
      router.replace("/teacher/schedule");
      setLoading(false);
      return;
    }

    const { data: studentRow } = await supabase
      .from("students")
      .select("inn")
      .eq("user_id", user.id)
      .maybeSingle();

    const studentInn = studentRow?.inn;

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_inn", studentInn ?? 0);

    const courseIds = (enrollments ?? []).map((e) => e.course_id).filter(Boolean);

    let sessions: Session[] = [];
    if (courseIds.length > 0) {
      const { data: sessionRows, error: sessionErr } = await supabase
        .from("course_sessions")
        .select(
          "id, course_id, starts_at, session_type, topic, location, courses(subjects(name, code))"
        )
        .in("course_id", courseIds)
        .order("starts_at", { ascending: true })
        .limit(200);

      if (sessionErr) setError(sessionErr.message);

      sessions =
        sessionRows?.map((row: any) => {
          const dayLabel = getDayLabel(row.starts_at);
          const time = new Date(row.starts_at).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return {
            id: row.id,
            day: dayLabel,
            time,
            subject: row.topic || row.courses?.subjects?.name || `Курс ${row.course_id}`,
            type: row.session_type || "lesson",
            location: row.location || "—",
            courseName: row.courses?.subjects?.name,
          };
        }) ?? [];
    }
    setWeekSchedule(groupSessions(sessions));

    const { data: noteRows, error: notesErr } = await supabase
      .from("notes")
      .select("id, title, content, tags")
      .order("created_at", { ascending: false })
      .limit(50);
    if (notesErr) setError(notesErr.message);

    const mappedNotes: Note[] =
      noteRows?.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.content ?? "",
        location: n.tags?.[0] ?? "",
        duration: n.tags?.[1] ?? "",
      })) ?? [];
    setNotes(mappedNotes);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateNote = async () => {
    const tags = [noteForm.location, noteForm.duration].filter(Boolean);
    await supabase.from("notes").insert({
      title: noteForm.title,
      content: noteForm.description,
      tags,
    });
    closeNoteModal();
    fetchData();
  };

  const handleEditNote = async () => {
    if (!noteEditId) return;
    const tags = [noteForm.location, noteForm.duration].filter(Boolean);
    await supabase
      .from("notes")
      .update({
        title: noteForm.title,
        content: noteForm.description,
        tags,
      })
      .eq("id", noteEditId);
    closeNoteModal();
    fetchData();
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

  const handleDeleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Учебный график</p>
          <h2 className="mt-2 text-3xl font-semibold">
            Расписание из Supabase. Студент видит свои пары и может вести заметки.
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openCreateNote}
            className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-white"
          >
            Добавить заметку
          </button>
          <button
            onClick={fetchData}
            className="rounded-2xl border border-white/20 px-3 py-2 text-sm font-semibold text-white"
            title="Обновить данные"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
          Ошибка загрузки: {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {weekSchedule.map((day) => (
          <article key={day.day} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-lg font-semibold text-white">{day.day}</h3>
            <ul className="mt-4 space-y-3">
              {day.sessions.map((session) => (
                <li
                  key={session.id}
                  className="rounded-2xl border border-white/5 bg-white/5 p-3 transition"
                >
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
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400">
                    {session.location}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {session.courseName ? `Курс: ${session.courseName}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {notes.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-center justify-between rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-white"
            >
              <div>
                <p className="text-sm text-emerald-200">{note.duration || "Без длительности"}</p>
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
                    Редактировать
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

      {isNoteModalOpen && (
        <NoteModal
          title={noteEditId != null ? "Редактировать заметку" : "Добавить заметку"}
          form={noteForm}
          setForm={setNoteForm}
          onSubmit={noteEditId != null ? handleEditNote : handleCreateNote}
          onClose={closeNoteModal}
        />
      )}
    </div>
  );
}
