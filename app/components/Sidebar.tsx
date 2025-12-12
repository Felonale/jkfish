"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  CalendarClock,
  ChartPie,
  HomeIcon,
  LogIn,
  NotebookPen,
  Shield,
  User2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
  hideWhenAuthed?: boolean;
  requiresAdmin?: boolean;
};

const navItems: NavItem[] = [
  { href: "/", label: "Главная", icon: HomeIcon },
  { href: "/grades", label: "Оценки", icon: ChartPie, requiresAuth: true },
  { href: "/schedule", label: "Расписание", icon: CalendarClock, requiresAuth: true },
  { href: "/tasks", label: "Задания", icon: BookOpenCheck, requiresAuth: true },
  { href: "/notes", label: "Заметки", icon: NotebookPen, requiresAuth: true },
  { href: "/profile", label: "Профиль", icon: User2, requiresAuth: true },
  { href: "/admin", label: "Admin", icon: Shield, requiresAuth: true, requiresAdmin: true },
  { href: "/auth/login", label: "Войти", icon: LogIn, hideWhenAuthed: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const hydrateUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      setIsAuthed(Boolean(session));
      setUserEmail(session?.user?.email ?? null);

      if (!session?.user) {
        setIsAdmin(false);
        setIsTeacher(false);
        setStudentName(null);
        setTeacherName(null);
        return;
      }

      const userId = session.user.id;

      const [{ data: adminRow }, { data: teacherRow }, { data: studentRow }] = await Promise.all([
        supabase.from("superadmins").select("user_id").eq("user_id", userId).maybeSingle(),
        supabase
          .from("teachers")
          .select("first_name,last_name,middle_name,user_id")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("students")
          .select("Name,Last_Name,Middle_Name,user_id")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      setIsAdmin(Boolean(adminRow));
      setIsTeacher(Boolean(teacherRow));

      if (teacherRow) {
        setTeacherName(
          [teacherRow.last_name, teacherRow.first_name, teacherRow.middle_name].filter(Boolean).join(" ")
        );
      } else {
        setTeacherName(null);
      }

      if (studentRow) {
        setStudentName([studentRow.Last_Name, studentRow.Name, studentRow.Middle_Name].filter(Boolean).join(" "));
      } else {
        setStudentName(null);
      }
    };

    hydrateUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session));
      setUserEmail(session?.user?.email ?? null);
      if (!session?.user) {
        setIsAdmin(false);
        setIsTeacher(false);
        setStudentName(null);
        setTeacherName(null);
        return;
      }
      hydrateUser();
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const itemsToRender = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.hideWhenAuthed && isAuthed) return false;
        if (item.requiresAuth && !isAuthed) return false;
        if (item.requiresAdmin && !(isAdmin || isTeacher)) return false;
        return true;
      }),
    [isAuthed, isAdmin, isTeacher]
  );

  const roleLabel = isAdmin ? "Суперадмин" : isTeacher ? "Преподаватель" : studentName ? "Студент" : "";
  const displayName = teacherName || studentName || userEmail || "Пользователь";

  return (
    <aside
      className="
        group/sidebar
        sticky top-0
        hidden lg:flex
        h-screen
        w-16 hover:w-64
        flex-col
        border-r border-white/10
        bg-slate-950/95
        px-3 py-8
        text-white
        transition-[width] duration-300 ease-in-out
      "
    >
      <div className="flex items-center gap-3 pb-8">
        <div
          className="
          flex h-10 min-w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500
          to-cyan-400 text-lg font-semibold select-none
          "
        >
          JK
        </div>
        <div
          className="
            whitespace-nowrap
            opacity-0 -translate-x-2
            group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0
            transition-all duration-200
          "
        >
          <strong className="block text-lg">JKFish Academy</strong>
          <span className="text-sm text-slate-400">Учебный портал · 2025</span>
        </div>
      </div>

      <nav className="flex-1">
        <p
          className="
            text-xs uppercase tracking-[0.3em] text-slate-500
            opacity-0 -translate-x-2
            group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0
            transition-all duration-200
          "
        >
          Навигация
        </p>
        <ul className="mt-4 space-y-2">
          {itemsToRender.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3
                    rounded-xl border border-transparent
                    px-2.5 py-2
                    text-sm
                    transition
                    ${
                      isActive
                        ? "border-violet-400/40 bg-violet-400/10 text-white"
                        : "text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} className="shrink-0" />
                  <span
                    className="
                      whitespace-nowrap
                      opacity-0 -translate-x-2
                      group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0
                      transition-all duration-200
                    "
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {isAuthed && (
        <div className="space-y-2">
          <div
            className="
              rounded-xl border border-white/10 bg-white/5 px-3 py-2
              opacity-0 group-hover/sidebar:opacity-100
              transition-all duration-200
            "
          >
            <p className="text-xs text-slate-300">{roleLabel || "Авторизован"}</p>
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            {userEmail && <p className="truncate text-[10px] text-slate-400">{userEmail}</p>}
          </div>
          <div
            className="
              opacity-0 group-hover/sidebar:opacity-100
              transition-all duration-200
            "
          >
            <LogoutButton />
          </div>
        </div>
      )}
    </aside>
  );
}
