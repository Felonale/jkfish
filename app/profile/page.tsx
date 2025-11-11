import styles from '../styles/Profile.module.css';

export default function ProfilePage() {
  const student = {
    name: 'Имя Фамилия',
    id: '202500123',
    faculty: 'Факультет информационных технологий',
    email: 'johnny@student.kz',
  };

  return (
    <div className={styles.profile}>
      <h2>Профиль студента</h2>
      <p><strong>ФИО:</strong> {student.name}</p>
      <p><strong>ID:</strong> {student.id}</p>
      <p><strong>Курс:</strong> {student.faculty}</p>
      <p><strong>Email:</strong> {student.email}</p>
    </div>
  );
}