import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>Платонус+</h1>
      <span>Добро пожаловать</span>
    </header>
  );
}