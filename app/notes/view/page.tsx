'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Trash2, FileDown, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Note = {
  id: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export default function ViewNotePage() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('id');
  const supabase = createClient();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('id,title,content,tags,created_at,updated_at')
        .eq('id', id)
        .single();
      if (error) console.error('Ошибка загрузки конспекта:', error);
      if (data) {
        setNote(data);
        setTitle(data.title);
        setContent(data.content ?? '');
        setTags(data.tags?.join(', ') ?? '');
      }
      setLoading(false);
    };
    fetchNote();
  }, [id, supabase]);

  const saveEdit = async () => {
    if (!note) return;
    const updatedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    const { error, data } = await supabase
      .from('notes')
      .update({ title, content, tags: updatedTags })
      .eq('id', note.id)
      .select()
      .single();
    if (error) {
      console.error('Ошибка сохранения:', error);
      return;
    }
    setNote(data);
  };

  const exportMarkdown = () => {
    if (!note) return;
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
    if (!note) return;
    const { error } = await supabase.from('notes').delete().eq('id', note.id);
    if (error) {
      console.error('Ошибка удаления:', error);
      return;
    }
    setConfirmDeleteOpen(false);
    router.push('/notes');
  };

  if (!id) return <p className="text-white">Нет id конспекта</p>;
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-32 w-full"></div>
        ))}
      </div>
    );
  }
  if (!note) return <p className="text-white">Конспект не найден</p>;

  return (
    <div className="space-y-6 text-white">
      <button
        onClick={() => router.push('/notes')}
        className="inline-flex items-center gap-2 text-slate-300 hover:text-white"
      >
        <ArrowLeft size={18} /> Назад
      </button>

      <article className="space-y-4">
        <header className="space-y-2">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveEdit}
            className="w-full bg-transparent text-2xl font-bold focus:outline-none"
          />
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            onBlur={saveEdit}
            placeholder="Теги через запятую"
            className="w-full rounded-full border border-violet-300/40 bg-violet-400/10 px-3 py-1 text-sm text-slate-200 focus:outline-none"
          />
          <p className="text-sm text-slate-400">
            {new Intl.DateTimeFormat('ru-RU', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(note.updated_at ?? note.created_at))}
          </p>
        </header>

        <div
          contentEditable
          suppressContentEditableWarning
          onInput={e => setContent((e.target as HTMLElement).innerText)}
          onBlur={saveEdit}
          className="prose prose-invert max-w-none focus:outline-none p-3 rounded-xl bg-slate-800 text-white"
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
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
      </article>

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Удалить конспект?</h2>
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-300">
              Вы уверены, что хотите удалить конспект <strong>«{note.title}»</strong>? Это действие необратимо.
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