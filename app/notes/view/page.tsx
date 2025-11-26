'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Trash2, FileDown, PenLine, X } from 'lucide-react';

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
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string>('');
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
      if (error) console.error('Ошибка загрузки заметки:', error);
      if (data) {
        setNote(data);
        setTitle(data.title);
        setContent(data.content ?? '');
        setTags(data.tags ? data.tags.join(', ') : '');
      }
      setLoading(false);
    };
    fetchNote();
  }, [id, supabase]);

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
      console.error('Ошибка редактирования:', error);
      return;
    }
    setNote(data);
    setEditing(false);
  };

  if (!id) return <p className="text-white">Нет id заметки</p>;
  if (loading) return <p className="text-white">Загрузка...</p>;
  if (!note) return <p className="text-white">Заметка не найдена</p>;

  return (
    <div className="space-y-6 text-white">
      <button
        onClick={() => router.push('/notes')}
        className="inline-flex items-center gap-2 text-slate-300 hover:text-white"
      >
        <ArrowLeft size={18} /> Назад
      </button>

      {editing ? (
        <div className="space-y-4">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Заголовок заметки"
            className="w-full rounded-xl bg-slate-800 p-3 text-white placeholder-slate-400"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Содержимое заметки"
            className="w-full rounded-xl bg-slate-800 p-3 text-white placeholder-slate-400"
            rows={10}
          />
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Теги через запятую"
            className="w-full rounded-xl bg-slate-800 p-3 text-white placeholder-slate-400"
          />
          <div className="flex gap-3">
            <button
              onClick={saveEdit}
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold hover:bg-violet-600"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setTitle(note.title);
                setContent(note.content ?? '');
                setTags(note.tags ? note.tags.join(', ') : '');
              }}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <article className="space-y-4">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold">{note.title}</h1>
            <p className="text-sm text-slate-400">
              {new Intl.DateTimeFormat('ru-RU', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(note.updated_at ?? note.created_at))}
            </p>
          </header>

          <div className="text-slate-200 whitespace-pre-line">
            {note.content ?? 'Заметка пустая.'}
          </div>

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

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:underline"
            >
              <PenLine size={16} /> Редактировать
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
        </article>
      )}

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 text-white shadow-xl space-y-4">
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
              Вы уверены, что хотите удалить заметку{' '}
              <strong>«{note.title}»</strong>? Это действие необратимо.
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

