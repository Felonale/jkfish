'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setMessage(
      error ? error.message : 'Готово! Мы перенаправим вас на защищённые страницы в течение секунды.',
    );
    setPending(false);
  };

  return (
    <div className="grid gap-8 rounded-[32px] border border-white/15 bg-white/5 p-8 text-white lg:grid-cols-2">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-300">JKFish Academy</p>
        <h1 className="text-3xl font-semibold">
          Войдите и продолжайте прокачивать свой прогресс в Supabase.
        </h1>
        <span className="text-sm text-slate-300">
          Все аналитики и расписания синхронизируются через Supabase и защищены SSO.
        </span>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/50 p-6">
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-200">
          Email
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="you@jkfish.dev"
            required
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-200">
          Пароль
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Подключаем Supabase…
            </>
          ) : (
            'Войти'
          )}
        </button>

        {message && <p className="text-sm text-amber-200">{message}</p>}

        <div className="flex flex-wrap justify-between text-sm text-violet-200">
          <Link href="/auth/reset">Забыли пароль?</Link>
          <Link href="/auth/signup">Создать аккаунт</Link>
        </div>
      </form>
    </div>
  );
}
