import './globals.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Платонус+',
  description: 'Студенческий портал: расписание, оценки, профиль',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <div style={{ flex: 1 }}>
            <Header />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}