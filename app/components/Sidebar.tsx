'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpenCheck,
  CalendarClock,
  ChartPie,
  HomeIcon,
  LogIn,
  NotebookPen,
  User2,
} from 'lucide-react';
import styles from '../styles/Sidebar.module.css';

const navItems = [
  { href: '/', label: 'Главная', icon: HomeIcon },
  { href: '/grades', label: 'Оценки и аналитика', icon: ChartPie },
  { href: '/schedule', label: 'Расписание', icon: CalendarClock },
  { href: '/notes', label: 'Конспекты', icon: NotebookPen },
  { href: '/profile', label: 'Профиль', icon: User2 },
  { href: '/login', label: 'Войти / сменить аккаунт', icon: LogIn },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoBlock}>
        <div className={styles.logoBadge}>JK</div>
        <div>
          <strong>JKFish Academy</strong>
          <span>Учебный поток · 2025</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <span className={styles.sectionTitle}>Навигация</span>
        <ul>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.syncCard}>
        <div>
          <p>Подключите новые курсы</p>
          <span>Данные подтянутся из Supabase в один клик.</span>
        </div>
        <Link href="/protected" className={styles.syncButton}>
          <BookOpenCheck size={18} />
          Добавить курс
        </Link>
      </div>
    </aside>
  );
}
