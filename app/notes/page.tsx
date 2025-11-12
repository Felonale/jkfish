import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CalendarClock, PenLine, Plus, Tag } from 'lucide-react';

export const revalidate = 0;

type Note = {
  id: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export default async function NotesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notes')
    .select('id,title,content,tags,created_at,updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Не удалось получить конспекты', error);
  }

  const notes: Note[] = data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Конспекты и идеи</p>
          <h1 className="mt-2 text-3xl font-semibold">Держите все заметки рядом со спринтом.</h1>
          <span className="text-sm text-slate-300">
            Любая запись синхронизируется через Supabase, так что к ней можно вернуться на любом
            устройстве.
          </span>
        </div>
        <Link
          href="/notes/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          Добавить заметку
        </Link>
      </header>

      {notes.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-white">
          <PenLine size={28} className="text-violet-200" />
          <h2 className="text-2xl font-semibold">Пока пусто</h2>
          <p className="text-sm text-slate-400">
            Создайте первую заметку — сюда попадут все ваши идеи и материалы по курсам.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {notes.map(note => (
            <article
              key={note.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                <h3 className="text-lg font-semibold text-white">{note.title}</h3>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                  <CalendarClock size={14} />
                  {new Intl.DateTimeFormat('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(note.updated_at ?? note.created_at))}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                {note.content?.slice(0, 200) ?? 'Текст появится, как только вы напишете заметку.'}
              </p>
              {note.tags && note.tags.length > 0 && (
                <div className="inline-flex items-center gap-2 text-xs text-slate-300">
                  <Tag size={14} />
                  <ul className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                      <li
                        key={tag}
                        className="rounded-full border border-violet-300/40 bg-violet-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
