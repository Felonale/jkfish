'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpenCheck,
  CalendarClock,
  ChartPie,
  HomeIcon,
  LogIn,
  NotebookPen,
  User2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
  hideWhenAuthed?: boolean;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Главная', icon: HomeIcon },
  { href: '/grades', label: 'Оценки и аналитика', icon: ChartPie, requiresAuth: true },
  { href: '/schedule', label: 'Расписание', icon: CalendarClock, requiresAuth: true },
  { href: '/notes', label: 'Конспекты', icon: NotebookPen, requiresAuth: true },
  { href: '/profile', label: 'Профиль', icon: User2, requiresAuth: true },
  { href: '/login', label: 'Войти', icon: LogIn, hideWhenAuthed: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setIsAuthed(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session));
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const itemsToRender = useMemo(
    () =>
      navItems.filter(item => {
        if (item.hideWhenAuthed && isAuthed) return false;
        if (item.requiresAuth && !isAuthed) return false;
        return true;
      }),
    [isAuthed],
  );

  return (
    <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-950/95 px-5 py-8 text-white lg:flex">
      <div className="flex items-center gap-3 pb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-semibold">
          JK
        </div>
        <div>
          <strong className="block text-lg">JKFish Academy</strong>
          <span className="text-sm text-slate-400">Учебный поток · 2025</span>
        </div>
      </div>

      <nav className="flex-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Навигация</p>
        <ul className="mt-4 space-y-2">
          {itemsToRender.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition ${
                    isActive
                      ? 'border-violet-400/40 bg-violet-400/10 text-white'
                      : 'text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="rounded-2xl border border-violet-300/40 bg-violet-500/10 p-4 text-sm text-violet-50">
        <p className="font-semibold text-white">Подключите новые курсы</p>
        <span className="mt-1 block text-violet-100/80">
          Данные подтянутся из Supabase в один клик.
        </span>
        <Link
          href={isAuthed ? '/protected' : '/login'}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-white"
        >
          <BookOpenCheck size={18} />
          {isAuthed ? 'Добавить курс' : 'Войти, чтобы добавить'}
        </Link>
      </div>
    </aside>
  );
}
