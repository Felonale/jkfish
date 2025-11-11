import styles from '../styles/Card.module.css';

interface CardProps {
  title: string;
  description: string;
  percent?: number;
  eyebrow?: string;
  footer?: string;
  highlight?: string;
}

export default function Card({
  title,
  description,
  percent,
  eyebrow,
  footer,
  highlight,
}: CardProps) {
  return (
    <article className={styles.card}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <div className={styles.cardBody}>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {highlight && <span className={styles.highlight}>{highlight}</span>}
      </div>

      {typeof percent === 'number' && (
        <div className={styles.progressBlock}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>
          <span className={styles.progressValue}>{percent}%</span>
        </div>
      )}

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </article>
  );
}
