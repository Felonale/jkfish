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
  const [sortOption, setSortOption] = useState('name');

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('id,title,content,tags,created_at,updated_at')
        .order('updated_at', { ascending: false });
      if (error) console.error('Ошибка загрузки конспектов:', error);
      if (data) setNotes(data as Note[]);
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
    const q = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matchesTag = activeTag ? (n.tags ?? []).includes(activeTag) : true;
    const text = [
      n.title.toLowerCase(),
      (n.content ?? '').toLowerCase(),
      (n.tags ?? []).join(' ').toLowerCase()
    ].join(' ');
    const matchesSearch = q.length > 0 ? q.every(word => text.includes(word)) : true;
    return matchesTag && matchesSearch;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortOption === 'name') {
      return a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' });
    }
    if (sortOption === 'nameDesc') {
      return b.title.localeCompare(a.title, 'ru', { sensitivity: 'base' });
    }
    if (sortOption === 'tags') {
      return (b.tags?.length ?? 0) - (a.tags?.length ?? 0);
    }
    if (sortOption === 'date') {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-32 w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white animate-fadeInUp">
      <header className="space-y-4">
        <div className="rounded-xl bg-slate-900 p-6 text-white shadow-lg hover:shadow-xl transition">
          <h1 className="text-2xl font-bold">Держите все конспекты рядом со спринтом</h1>
          <p className="text-slate-400">
            Легкая система управления через Subjex.me, так что вы можете использовать её на любом устройстве.
          </p>
          <button
            onClick={() => router.push('/notes/new')}
            className="mt-4 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold hover:bg-violet-600 transition-transform hover:scale-105"
          >
            + Добавить конспект
          </button>
        </div>

        <div className="relative w-full">
          <input
            type="text"
            placeholder="Поиск по заголовку, содержимому и тегам..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-800 p-3 pl-10 text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 transition"
          />
          <span className="absolute left-3 top-3 text-slate-400">🔍</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'name', label: 'Имя A–Z', icon: '🔤' },
            { key: 'nameDesc', label: 'Имя Z–A', icon: '🔡' },
            { key: 'date', label: 'Дата', icon: '⏰' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortOption(opt.key)}
              className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-transform duration-300 ${
                sortOption === opt.key
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-105'
              }`}
            >
              <span>{opt.icon}</span> {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {uniqueTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs transition-transform duration-300 ${
                activeTag === tag
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-105'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-400 flex gap-4">
          <span>Всего конспектов: {notes.length}</span>
          <span>Тегов: {uniqueTags.length}</span>
          <span>Последнее обновление: {lastUpdate}</span>
        </div>
      </header>

      <Section
        title="Все конспекты"
        notes={sortedNotes}
        generateDescription={generateDescription}
        router={router}
      />
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
    <section className="animate-fadeInUp">
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
    <div className="rounded-xl bg-slate-800 p-4 space-y-2 shadow hover:shadow-2xl transition-transform duration-300 hover:scale-105 hover:-translate-y-1 animate-fadeInUp">
      <h3 className="text-lg font-bold">{note.title}</h3>
      <p className="text-sm text-slate-300">
        {note.content ? generateDescription(note.content) : 'Описание отсутствует'}
      </p>
      <p className="text-xs text-slate-400">Обновлено {formattedDate}</p>
      {note.tags && note.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-xs text-slate-300">
          {note.tags.map(tag => (
            <li
              key={tag}
              className="rounded-full border border-violet-300/40 bg-violet-400/10 px-3 py-1 uppercase tracking-[0.2em] transition-transform duration-300 hover:bg-violet-400/20 hover:scale-105"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.push(`/notes/view?id=${note.id}`)}
          className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 hover:scale-105 transition-transform"
        >
          <Eye size={16} /> Открыть
        </button>
        <button
          onClick={exportMarkdown}
          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 hover:scale-105 transition-transform"
        >
          <FileDown size={16} /> Экспорт .md
        </button>
        <button
          onClick={() => setConfirmDeleteOpen(true)}
          className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:scale-105 transition-transform"
        >
          <Trash2 size={16} /> Удалить
        </button>
      </div>

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeInUp">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 text-white shadow-xl space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Удалить конспект?</h2>
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                className="text-slate-400 hover:text-white transition"
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
                className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
              >
                Отмена
              </button>
              <button
                onClick={deleteNote}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-transform hover:scale-105"
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
     