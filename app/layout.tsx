import './globals.css';
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
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <div className="flex flex-1 flex-col border-l border-white/10 bg-slate-950/90">
            <Header />
            <main className="w-full">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
