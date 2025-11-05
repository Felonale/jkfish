'use client';

import styles from '../styles/Login.module.css';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Вход выполнен: ${email}`);
  };

  return (
    <div className={styles.login}>
      <h2>Вход</h2>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={styles.loginInput}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className={styles.loginInput}
        />
        <button type="submit" className={styles.loginButton}>Войти</button>
      </form>
    </div>
  );
}