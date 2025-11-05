import styles from '../styles/Schedule.module.css';

export default function SchedulePage() {
  const schedule = [
    { day: 'Понедельник', subject: 'Математика — 09:00' },
    { day: 'Вторник', subject: 'Физика — 11:00' },
    { day: 'Среда', subject: 'Программирование — 14:00' },
  ];

  return (
    <div className={styles.schedule}>
      <h2>Расписание занятий</h2>
      <ul className={styles.scheduleList}>
        {schedule.map((item, index) => (
          <li key={index} className={styles.scheduleItem}>
            {item.day}: {item.subject}
          </li>
        ))}
      </ul>
    </div>
  );
}