'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const { data, error, status } = await supabase.from('notes').insert({
      title: title.trim(),
      content: content.trim() || null,
      tags: tagArray.length > 0 ? tagArray : null,
    });

    if (error) {
      console.error('Ошибка при сохранении:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        raw: error,
      });
      setErrorMsg(error.message || 'Неизвестная ошибка');
      return;
    }

    router.push('/notes');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 p-6 text-white">
      <h1 className="text-2xl font-semibold">Новая заметка</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full rounded-xl bg-slate-800 p-3 text-white placeholder-slate-400"
          required
        />

        <textarea
          placeholder="Текст заметки"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full h-40 rounded-xl bg-slate-800 p-3 text-white placeholder-slate-400 resize-none"
        />

        <input
          type="text"
          placeholder="Теги (через запятую)"
          value={tags}
          onChange={e => setTags(e.target.value)}
          className="w-full rounded-xl bg-slate-800 p-3 text-white placeholder-slate-400"
        />

        {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}

        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 font-semibold text-white"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}