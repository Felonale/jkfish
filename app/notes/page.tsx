'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  CalendarClock,
  PenLine,
  Plus,
  Tag,
  Trash2,
  Search,
  X,
} from 'lucide-react';

type Note = {
  id: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const supabase = createClient();

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('id,title,content,tags,created_at,updated_at')
      .order('created_at', { ascending: false });

    if (error) console.error('Ошибка загрузки заметок:', error);
    setNotes(data ?? []);
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    const { error } = await supabase.from('notes').delete().eq('id', noteToDelete.id);
    if (error) console.error('Ошибка удаления:', error);
    setNoteToDelete(null);
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 relative">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Конспекты и идеи</p>
          <h1 className="mt-2 text-3xl font-semibold">Держите все заметки рядом со спринтом.</h1>
          <span className="text-sm text-slate-300">
            Любая запись синхронизируется через Supabase, так что к ней можно вернуться на любом устройстве.
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

      <div className="flex items-center gap-2 px-2">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Поиск по заголовку..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-xl bg-slate-800 p-3 text-white placeholder-slate-400"
        />
      </div>

      {loading ? (
        <p className="text-white">Загрузка...</p>
      ) : filteredNotes.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-white">
          <PenLine size={28} className="text-violet-200" />
          <h2 className="text-2xl font-semibold">Ничего не найдено</h2>
          <p className="text-sm text-slate-400">
            Попробуйте изменить запрос или сбросить поиск.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {filteredNotes.map(note => (
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
                    {note.tags.map((tag: string) => (
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
              <button
                onClick={() => setNoteToDelete(note)}
                className="mt-2 inline-flex items-center gap-2 text-sm text-red-400 hover:underline"
              >
                <Trash2 size={16} />
                Удалить
              </button>
            </article>
          ))}
        </section>
      )}

      {noteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Удалить заметку?</h2>
              <button onClick={() => setNoteToDelete(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-300">
              Вы уверены, что хотите удалить заметку <strong>«{noteToDelete.title}»</strong>? Это действие необратимо.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setNoteToDelete(null)}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}