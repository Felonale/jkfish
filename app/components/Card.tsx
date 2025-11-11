import styles from '../styles/Card.module.css';

interface CardProps {
  title: string;
  description: string;
  percent?: number;
}

export default function Card({ title, description, percent = 0 }: CardProps) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
