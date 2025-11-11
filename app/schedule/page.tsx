import { Clock3, MapPin } from 'lucide-react';
import styles from '../styles/Schedule.module.css';

const weekSchedule = [
  {
    day: 'Понедельник',
    sessions: [
      { time: '09:00', subject: 'Алгоритмы · лайв-решения', type: 'Лекция', location: 'Кампус · Аудитория C1' },
      { time: '13:00', subject: 'Проектное окно', type: 'Фокус', location: 'Miro board' },
    ],
  },
  {
    day: 'Вторник',
    sessions: [
      { time: '11:00', subject: 'Математический практикум', type: 'Семинар', location: 'Zoom · Поток S' },
    ],
  },
  {
    day: 'Среда',
    sessions: [
      { time: '10:30', subject: 'Product review', type: 'Sync', location: 'Notion doc' },
      { time: '15:00', subject: 'Supabase Edge Functions', type: 'Workshop', location: 'Online lab' },
    ],
  },
];

const focusBlocks = [
  { title: 'Deep Work', duration: '120 мин', description: 'Работа над финальным проектом без отвлечений.' },
  { title: 'Mentor Hours', duration: '45 мин', description: 'Открытый слот для вопросов по коду.' },
];

export default function SchedulePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Ваш темп обучения</p>
          <h2>Гибкое расписание, которое синхронизируется с Supabase.</h2>
        </div>
        <button type="button">Добавить событие</button>
      </header>

      <section className={styles.timeline}>
        {weekSchedule.map(day => (
          <article key={day.day}>
            <h3>{day.day}</h3>
            <ul>
              {day.sessions.map(session => (
                <li key={`${day.day}-${session.time}`}>
                  <div>
                    <span className={styles.time}>{session.time}</span>
                    <strong>{session.subject}</strong>
                    <span className={styles.type}>{session.type}</span>
                  </div>
                  <div className={styles.meta}>
                    <Clock3 size={16} />
                    <span>{session.location}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className={styles.focusBlocks}>
        {focusBlocks.map(block => (
          <div key={block.title} className={styles.focusCard}>
            <div>
              <p>{block.duration}</p>
              <h4>{block.title}</h4>
            </div>
            <div className={styles.focusMeta}>
              <MapPin size={16} />
              {block.description}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
