'use client';
import { useParams, useRouter } from 'next/navigation';
import styles from '../../styles/GradeDetails.module.css';

export default function GradeDetails() {
  const router = useRouter();
  const { subject } = useParams();

  const subjects = {
    math: {
      name: 'Математика',
      teacher: 'Иванов И.И.',
      grades: [
        { type: 'Контрольная 1', grade: 85 },
        { type: 'Домашняя работа', grade: 92 },
        { type: 'Экзамен', grade: 78 },
      ],
    },
    physics: {
      name: 'Физика',
      teacher: 'Петров П.П.',
      grades: [
        { type: 'Лабораторная', grade: 88 },
        { type: 'Тест', grade: 91 },
        { type: 'Экзамен', grade: 84 },
      ],
    },
    programming: {
      name: 'Программирование',
      teacher: 'Сидоров С.С.',
      grades: [
        { type: 'Практика 1', grade: 97 },
        { type: 'Проект', grade: 100 },
        { type: 'Экзамен', grade: 95 },
      ],
    },
  };

  const current = subjects[subject as keyof typeof subjects];

  if (!current) {
    return <p>Предмет не найден</p>;
  }

  return (
    <div className={styles.container}>
      <h2>{current.name}</h2>
      <p><strong>Преподаватель:</strong> {current.teacher}</p>
      <h3>Оценки:</h3>
      <ul>
        {current.grades.map((item, index) => (
          <li key={index}>
            {item.type}: {item.grade}%
          </li>
        ))}
      </ul>
      <button onClick={() => router.back()}>Назад</button>
    </div>
  );
}
