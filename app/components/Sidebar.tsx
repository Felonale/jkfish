import styles from '../styles/Sidebar.module.css';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul>
          <li><Link href="/grades">Оценки</Link></li>
          <li><Link href="/schedule">Расписание</Link></li>
          <li><Link href="/profile">Профиль</Link></li>
          <li><Link href="/login">Вход</Link></li>
        </ul>
      </nav>
    </aside>
  );
}