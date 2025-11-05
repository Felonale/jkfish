import styles from '../styles/Grades.module.css';
import Card from '../components/Card';

export default function GradesPage() {
  const grades = [
    { title: 'Математика', description: 'Оценка: A (90%)' },
    { title: 'Физика', description: 'Оценка: B+ (85%)' },
    { title: 'Программирование', description: 'Оценка: A+ (98%)' },
  ];

  return (
    <div className={styles.container}>
      <h2>Мои оценки</h2>
      <div className={styles.cards}>
        {grades.map((grade, index) => (
          <Card key={index} title={grade.title} description={grade.description} />
        ))}
      </div>
    </div>
  );
}