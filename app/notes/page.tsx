'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Eye, Trash2, FileDown, X } from 'lucide-react';

type Note = {
  id: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export default function NotesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('id,title,content,tags,created_at,updated_at')
        .order('updated_at', { ascending: false });
      if (error) console.error('Ошибка загрузки заметок:', error);
      if (data) setNotes(data);
      setLoading(false);
    };
    fetchNotes();
  }, [supabase]);

  const generateDescription = (text: string) => {
    const sentences = text.match(/[^.!?]+[.!?]/g);
    return sentences?.slice(0, 2).join(' ') ?? text.slice(0, 200);
  };

  const uniqueTags = Array.from(new Set(notes.flatMap(n => n.tags ?? [])));
  const lastUpdate = notes.length
    ? new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(
        new Date(
          Math.max(...notes.map(n => new Date(n.updated_at).getTime()))
        )
      )
    : '—';

  const filteredNotes = notes.filter(n => {
    const matchesTag = activeTag ? n.tags?.includes(activeTag) : true;
    const matchesSearch = searchQuery
      ? n.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesTag && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.tags?.includes('pinned'));
  const recentNotes = [...filteredNotes]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 5);
  const otherNotes = filteredNotes.filter(
    n => !pinnedNotes.includes(n) && !recentNotes.includes(n)
  );

  if (loading) return <p className="text-white">Загрузка...</p>;

  return (
    <div className="space-y-6 text-white">
      <header className="space-y-4">
        <div className="rounded-xl bg-slate-900 p-6 text-white">
          <h1 className="text-2xl font-bold">Держите все заметки рядом со спринтом</h1>
          <p className="text-slate-400">
            Легкая система управления через Subjex.me, так что вы можете использовать её на любом устройстве.
          </p>
          <button
            onClick={() => router.push('/notes/new')}
            className="mt-4 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold hover:bg-violet-600"
          >
            + Добавить заметку
          </button>
        </div>

        <input
          placeholder="Поиск по заголовку..."
          className="w-full rounded-xl bg-slate-800 p-3 text-white placeholder-slate-400"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <div className="flex gap-2 flex-wrap">
          {uniqueTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs ${
                activeTag === tag
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-400">
          Всего заметок: {notes.length} | Тегов: {uniqueTags.length} | Последнее обновление: {lastUpdate}
        </div>
      </header>

      {pinnedNotes.length > 0 && (
        <Section
          title="Закреплённые"
          notes={pinnedNotes}
          generateDescription={generateDescription}
          router={router}
        />
      )}

      {recentNotes.length > 0 && (
        <Section
          title="Недавние изменения"
          notes={recentNotes}
          generateDescription={generateDescription}
          router={router}
        />
      )}

      {otherNotes.length > 0 && (
        <Section
          title="Все заметки"
          notes={otherNotes}
          generateDescription={generateDescription}
          router={router}
        />
      )}
    </div>
  );
}

function Section({
  title,
  notes,
  generateDescription,
  router,
}: {
  title: string;
  notes: Note[];
  generateDescription: (text: string) => string;
  router: any;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            generateDescription={generateDescription}
            router={router}
          />
        ))}
      </div>
    </section>
  );
}

function NoteCard({
  note,
  generateDescription,
  router,
}: {
  note: Note;
  generateDescription: (text: string) => string;
  router: any;
}) {
  const supabase = createClient();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const exportMarkdown = () => {
    const blob = new Blob([`# ${note.title}\n\n${note.content ?? ''}`], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (note.title || 'note').trim().replace(/\s+/g, '_');
    a.href = url;
    a.download = `${safeName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteNote = async () => {
    const { error } = await supabase.from('notes').delete().eq('id', note.id);
    if (error) {
      console.error('Ошибка удаления:', error);
      return;
    }
    setConfirmDeleteOpen(false);
    router.refresh?.();
  };

  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(note.updated_at ?? note.created_at));

  return (
    <div className="rounded-xl bg-slate-800 p-4 space-y-2 shadow hover:shadow-lg transition">
      <h3 className="text-lg font-bold">{note.title}</h3>
      <p className="text-sm text-slate-300">
        {note.content ? generateDescription(note.content) : 'Нет описания'}
      </p>
      <p className="text-xs text-slate-400">Обновлено {formattedDate}</p>
      {note.tags && note.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-xs text-slate-300">
          {note.tags.map(tag => (
            <li
              key={tag}
              className="rounded-full border border-violet-300/40 bg-violet-400/10 px-3 py-1 uppercase tracking-[0.2em]"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.push(`/notes/view?id=${note.id}`)}
          className="inline-flex items-center gap-2 text-sm text-violet-400 hover:underline"
        >
          <Eye size={16} /> Открыть
        </button>
        <button
          onClick={exportMarkdown}
          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:underline"
        >
          <FileDown size={16} /> Экспорт .md
        </button>
        <button
          onClick={() => setConfirmDeleteOpen(true)}
          className="inline-flex items-center gap-2 text-sm text-red-400 hover:underline"
        >
          <Trash2 size={16} /> Удалить
        </button>
      </div>

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Удалить заметку?</h2>
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-300">
              Вы уверены, что хотите удалить «{note.title}»? Это действие необратимо.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Отмена
              </button>
              <button
                onClick={deleteNote}
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

