import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Card from '../components/Card';
import styles from '../styles/Grades.module.css';

const gradeGroups = [
  {
    id: 'math',
    subject: 'Математика для инженеров',
    grade: 'A',
    percent: 92,
    description: '12/14 модулей закрыты, впереди индивидуальный проект.',
    updated: 'Обновлено 40 минут назад',
  },
  {
    id: 'physics',
    subject: 'Физика и моделирование',
    grade: 'B+',
    percent: 84,
    description: 'Новые лабораторные работы загружены в Supabase storage.',
    updated: 'Сегодня · 10:05',
  },
  {
    id: 'programming',
    subject: 'Fullstack-разработка',
    grade: 'A-',
    percent: 88,
    description: 'Проект на Next.js + Drizzle переходит в код-ревью.',
    updated: 'Вчера · 22:18',
  },
];

const breakdownRows = [
  {
    title: 'Алгоритмический практикум',
    weight: '30%',
    status: 'Сдано',
    score: '94/100',
    due: '02 дек',
  },
  {
    title: 'Lab · Supabase Edge Functions',
    weight: '20%',
    status: 'В процессе',
    score: '—',
    due: '05 дек',
  },
  {
    title: 'Design critique · Новая панель',
    weight: '15%',
    status: 'Встреча назначена',
    score: '—',
    due: '07 дек',
  },
  {
    title: 'Итоговый коллоквиум',
    weight: '35%',
    status: 'Готов к записи',
    score: '—',
    due: '15 дек',
  },
];

export default function GradesPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Панель успеваемости</p>
          <h2>Отслеживайте качество обучения и не теряйте дедлайны.</h2>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.syncButton}>
            Синхронизировать Supabase
          </button>
          <Link href="/notes" className={styles.exportLink}>
            Экспорт отчёта
          </Link>
        </div>
      </header>

      <div className={styles.cardGrid}>
        {gradeGroups.map(group => (
          <Link key={group.id} href={`/grades/${group.id}`} className={styles.cardLink}>
            <Card
              eyebrow={`Текущая оценка: ${group.grade}`}
              title={group.subject}
              description={group.description}
              percent={group.percent}
              footer={group.updated}
              highlight={group.percent > 90 ? "Dean's list" : 'В работе'}
            />
          </Link>
        ))}
      </div>

      <section className={styles.detailSection}>
        <div className={styles.sectionHeading}>
          <div>
            <h3>Детализация заданий</h3>
            <span>Данные подгружаются из таблицы grades_breakdown</span>
          </div>
          <Link href="/notes" className={styles.sectionLink}>
            Добавить заметку
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Задание</th>
                <th>Вес</th>
                <th>Статус</th>
                <th>Оценка</th>
                <th>Дедлайн</th>
              </tr>
            </thead>
            <tbody>
              {breakdownRows.map(row => (
                <tr key={row.title}>
                  <td>{row.title}</td>
                  <td>{row.weight}</td>
                  <td>{row.status}</td>
                  <td>{row.score}</td>
                  <td>{row.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
