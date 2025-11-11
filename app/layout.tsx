import './globals.css';
import styles from './styles/Layout.module.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'JKFish Academy • Цифровой учебный кампус',
  description:
    'Современная учебная среда с аналитикой прогресса, расписанием и профилем студента, настроенная для Supabase + Vercel.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <div className={styles.shell}>
          <Sidebar />
          <div className={styles.contentRegion}>
            <Header />
            <main className={styles.main}>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
