'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Sparkles } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export default function OnboardingForm() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    inn: '',
    firstName: '',
    lastName: '',
    middleName: '',
  });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const innNumber = Number(form.inn);
    if (!Number.isFinite(innNumber) || innNumber <= 0) {
      setMessage('Введите корректный ИИН (только цифры).');
      setPending(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage('Сначала войдите в аккаунт, чтобы сохранить данные.');
        setPending(false);
        return;
      }

      const { error: upsertError } = await supabase.from('students').upsert(
        {
          inn: innNumber,
          Name: form.firstName.trim(),
          Last_Name: form.lastName.trim(),
          Middle_Name: form.middleName.trim() ? form.middleName.trim() : null,
        },
        { onConflict: 'inn' },
      );

      if (upsertError) throw upsertError;

      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}${
        form.middleName.trim() ? ` ${form.middleName.trim()}` : ''
      }`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          student_inn: innNumber,
          full_name: fullName,
        },
      });
      if (updateError) throw updateError;

      setMessage('Данные сохранены. Перенаправляем в профиль…');
      router.push('/profile');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось сохранить данные');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
      <div className="flex items-center justify-between">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-violet-200">
          <ArrowLeft size={16} />
          Назад к профилю
        </Link>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
          <Sparkles size={14} />
          Настройка студента
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-semibold">Добавьте данные о себе</h1>
        <p className="text-sm text-slate-400">
          Это нужно, чтобы привязать ваш аккаунт к учебным данным. Позже вы сможете изменить эти поля в профиле.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-200 md:col-span-2">
          ИИН
          <input
            type="text"
            inputMode="numeric"
            value={form.inn}
            onChange={handleChange('inn')}
            required
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
            placeholder="Например: 123456789012"
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
            placeholder="Асан"
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
            placeholder="Нуржанов"
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
    </div>
  );
}

