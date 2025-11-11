import { Activity, Sparkles, Wifi } from 'lucide-react';
import styles from '../styles/Header.module.css';

const quickStats = [
  { label: 'Активные курсы', value: '6', meta: '+2 за неделю' },
  { label: 'Выполнено сегодня', value: '4 задачи', meta: '120 мин фокуса' },
  { label: 'Средний прогресс', value: '78%', meta: 'данные Supabase' },
];

export default function Header() {
  const today = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <Sparkles size={16} />
          {today} · гибридное обучение без стресса
        </p>
        <h1>JKFish Learning Hub</h1>
        <p>
          Персональная зона студента с аналитикой в реальном времени, готовая к работе на Vercel
          и Supabase. Подключайте таблицы и мгновенно получайте свежие данные.
        </p>
        <div className={styles.statusBadge}>
          <Wifi size={16} />
          Supabase подключен
        </div>
      </div>

      <div className={styles.statGrid}>
        {quickStats.map(stat => (
          <article key={stat.label} className={styles.statCard}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <div>
              <Activity size={16} />
              {stat.meta}
            </div>
          </article>
        ))}
      </div>
    </header>
  );
}
