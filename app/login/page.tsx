'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from '../styles/Login.module.css';

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

    // Стандартная авторизация Supabase — замените на OAuth, если нужно.
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Готово! Мы перенаправим вас на защищённые страницы.');
    }

    setPending(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.branding}>
        <p>JKFish Academy</p>
        <h1>Войдите и продолжите прогресс.</h1>
        <span>Вся аналитика и материалы синхронизируются через Supabase и защищены SSO.</span>
      </div>

      <form className={styles.form} onSubmit={handleLogin}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="you@jkfish.dev"
            required
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className={styles.spinner} size={18} />
              Подключаем Supabase…
            </>
          ) : (
            'Войти'
          )}
        </button>

        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.links}>
          <Link href="/auth/reset">Забыли пароль?</Link>
          <Link href="/auth/signup">Создать аккаунт</Link>
        </div>
      </form>
    </div>
  );
}
