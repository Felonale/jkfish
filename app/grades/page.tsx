'use client';
import { useRouter } from 'next/navigation';
import styles from '../styles/Grades.module.css';
import Card from '../components/Card';

export default function GradesPage() {
  const router = useRouter();

  const grades = [
    { title: 'Математика', description: 'Оценка: A (90%)', link: '/grades/math' },
    { title: 'Физика', description: 'Оценка: B+ (85%)', link: '/grades/physics' },
    { title: 'Программирование', description: 'Оценка: A+ (98%)', link: '/grades/programming' },
  ];

  return (
    <div className={styles.container}>
      <h2>Мои оценки</h2>
      <div className={styles.cards}>
        {grades.map((grade, index) => (
          <div key={index} onClick={() => router.push(grade.link)}>
            <Card title={grade.title} description={grade.description} />
          </div>
        ))}
      </div>
    </div>
  );
}
