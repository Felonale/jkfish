'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Trash2, FileDown, X, UploadCloud } from 'lucide-react';
import { readDocxFile } from '@/lib/docxParser';

type Note = {
  id: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export default function NotesPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name');

  useEffect(() => {
    const fetchNotes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [{ data: teacherRow }, { data: superRow }] = await Promise.all([
          supabase.from('teachers').select('id').eq('user_id', user.id).maybeSingle(),
          supabase.from('superadmins').select('user_id').eq('user_id', user.id).maybeSingle(),
        ]);
        if (teacherRow || superRow) {
          router.replace('/teacher/notes');
          return;
        }
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('id,title,content,tags,created_at,updated_at')
        .order('updated_at', { ascending: false });
      if (error) console.error('Ошибка загрузки заметок:', error);
      if (data) setNotes(data as Note[]);
      setLoading(false);
    };
    fetchNotes();
  }, [router, supabase]);

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

  if (loading) return <div className="text-white">Загрузка...</div>;

  return (
    <main className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h1 className="text-3xl font-semibold">Заметки</h1>
        <p className="text-sm text-slate-300">
          Здесь можно хранить и редактировать свои заметки. Импортируйте файлы .md, .txt, .docx.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push('/notes/new')}
            className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 transition-transform hover:scale-105"
          >
            + Добавить заметку
          </button>
          <FileImporter
            onImport={async (title, content) => {
              const { error } = await supabase.from('notes').insert({ title, content });
              if (error) {
                console.error('Ошибка сохранения заметки:', error);
                alert('Не удалось сохранить заметку');
              } else {
                router.refresh?.();
              }
            }}
          />
        </div>

        <div className="relative w-full">
          <input
            type="text"
            placeholder="Поиск по заголовку, содержимому и тегам..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 pl-10 text-sm text-white placeholder:text-slate-500"
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
              className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-white/10 bg-white/5 transition ${
                sortOption === opt.key
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-300 hover:bg-white/10'
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
              className={`px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 transition ${
                activeTag === tag
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-400 flex gap-4">
          <span>Всего заметок: {notes.length}</span>
          <span>Тегов: {uniqueTags.length}</span>
          <span>Последнее обновление: {lastUpdate}</span>
        </div>
      </header>

      <Section
        title="Все заметки"
        notes={sortedNotes}
        generateDescription={generateDescription}
        router={router}
      />
    </main>
  );
}

function FileImporter({ onImport }: { onImport: (title: string, content: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    let text = '';

    try {
      if (ext === 'txt' || ext === 'md') {
        text = await file.text();
      } else if (ext === 'docx') {
        text = await readDocxFile(file);
      } else {
        alert('Неподдерживаемый формат');
        return;
      }

      onImport(file.name.replace(/\.[^/.]+$/, ''), text);
    } catch (err) {
      console.error('Ошибка импорта:', err);
      alert('Не удалось импортировать файл');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white inline-flex items-center gap-2 hover:bg-violet-600 transition-transform hover:scale-105"
      >
        <UploadCloud size={16} />
        Импорт заметки
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.docx"
        onChange={handleFile}
        className="hidden"
      />
    </>
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
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
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
    try {
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
    } catch (err) {
      console.error('Ошибка экспорта:', err);
      alert('Не удалось экспортировать заметку');
    }
  };

  const deleteNote = async () => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', note.id);
      if (error) {
        console.error('Ошибка удаления:', error);
        alert('Не удалось удалить заметку');
        return;
      }
      setConfirmDeleteOpen(false);
      router.refresh?.();
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить заметку');
    }
  };

  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(note.updated_at ?? note.created_at));

  return (
    <article
      className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 cursor-pointer"
      onClick={() => router.push(`/notes/view?id=${note.id}`)}
    >
      <h3 className="text-xl font-semibold">{note.title}</h3>
      <p className="text-sm text-slate-200">
        {note.content ? generateDescription(note.content) : 'Описание отсутствует'}
      </p>
      <p className="text-xs text-slate-400">Обновлено {formattedDate}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map(tag => (
            <span
              key={tag}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={e => {
            e.stopPropagation();
            exportMarkdown();
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
        >
          <FileDown size={14} /> Экспорт .md
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            setConfirmDeleteOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
        >
          <Trash2 size={14} /> Удалить
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
    </article>
  );
}