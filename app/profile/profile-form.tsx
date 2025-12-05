'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { Loader2, Save } from 'lucide-react';

type ProfileFormProps = {
  initialData: {
    inn: string;
    firstName: string;
    lastName: string;
    middleName: string;
    groupName: string;
    city: string;
    courseName: string;
  };
};

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [form, setForm] = useState(initialData);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
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

      setMessage('Данные сохранены. Обновите страницу, чтобы увидеть изменения.');
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
          <h2 className="text-2xl font-semibold">Данные студента (students)</h2>
          <p className="text-sm text-slate-400">
            ИНН/ФИО записываем в таблицу students, остальное сохраняем в метаданных профиля.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-200 md:col-span-2">
          ИНН
          <input
            type="number"
            value={form.inn}
            onChange={handleChange('inn')}
            required
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Например, 123456789012"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Имя
          <input
            type="text"
            value={form.firstName}
            onChange={handleChange('firstName')}
            required
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Иван"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Фамилия
          <input
            type="text"
            value={form.lastName}
            onChange={handleChange('lastName')}
            required
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Иванов"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200 md:col-span-2">
          Отчество (необязательно)
          <input
            type="text"
            value={form.middleName}
            onChange={handleChange('middleName')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Сергеевич"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Группа
          <input
            type="text"
            value={form.groupName}
            onChange={handleChange('groupName')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Группа / Cohort"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Город
          <input
            type="text"
            value={form.city}
            onChange={handleChange('city')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Алматы"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200 md:col-span-2">
          Название курса
          <input
            type="text"
            value={form.courseName}
            onChange={handleChange('courseName')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Вычислительная техника и программное обеспечение"
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
                Сохранить
              </>
            )}
          </button>
          {message && <p className="text-sm text-slate-200">{message}</p>}
        </div>
      </form>
    </section>
  );
}
