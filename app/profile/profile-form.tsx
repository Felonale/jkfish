'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ProfileFormProps = {
  initialData: {
    name: string;
    email: string;
    phone: string;
    location: string;
    cohort: string;
    track: string;
  };
};

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage(null);

try {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? 'Не удалось обновить профиль');
  }

  setMessage('Профиль обновлён');
  router.push('/profile');
  // или router.replace('/profile');
} catch (error) {
  setMessage(error instanceof Error ? error.message : 'Что-то пошло не так');
} finally {
  setPending(false);
}

  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Редактирование профиля</h2>
          <p className="text-sm text-slate-400">
            Измените контактные данные. Изменение email потребует подтверждения.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Имя и фамилия
          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Введите имя"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Email
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="you@jkfish.dev"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Телефон
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="+7 (700) 000-00-00"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Локация
          <input
            type="text"
            value={form.location}
            onChange={handleChange('location')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Алматы · гибрид"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Группа / Cohort
          <input
            type="text"
            value={form.cohort}
            onChange={handleChange('cohort')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Cohort · 2025"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Трек обучения
          <input
            type="text"
            value={form.track}
            onChange={handleChange('track')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Fullstack + Data"
          />
        </label>

        <div className="md:col-span-2 flex flex-col gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Сохраняем…
              </>
            ) : (
              <>
                <Save size={16} />
                Сохранить изменения
              </>
            )}
          </button>
          {message && (
            <p className="text-sm text-slate-200">
              {message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
