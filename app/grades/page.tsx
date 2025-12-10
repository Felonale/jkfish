"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import Card from "../components/Card";
import GradesChart from "../components/GradesChart";
import { createClient } from "@/lib/supabase/client";

type GradeGroup = {
  id: string;
  subject: string;
  grade: string;
  percent: number;
  description: string;
  updated: string;
};

type GradeRow = {
  enrollment_id: number;
  score: number;
  graded_at: string;
  comment: string | null;
  enrollments: {
    course_id: number | null;
    courses: {
      subject_id: number | null;
      subjects: {
        id: number;
        name: string;
        code: string | null;
      } | null;
    } | null;
  } | null;
};

const gradeToLetter = (score: number) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

const fallbackGradeGroups: GradeGroup[] = [
  {
    id: "demo-1",
    subject: "Курс #1",
    grade: "A",
    percent: 92,
    description: "Оценок: 4. Последняя: 95 (A)",
    updated: "Сегодня",
  },
  {
    id: "demo-2",
    subject: "Курс #2",
    grade: "B+",
    percent: 84,
    description: "Оценок: 5. Последняя: 84 (B)",
    updated: "Сегодня",
  },
  {
    id: "demo-3",
    subject: "Курс #3",
    grade: "A-",
    percent: 88,
    description: "Оценок: 5. Последняя: 87 (B+)",
    updated: "Сегодня",
  },
];

const breakdownRows = [
  { title: "Практика: базы данных и SQL", weight: "30%", status: "Сдано", score: "94/100", due: "02 мар" },
  { title: "Лабораторная: Supabase Edge Functions", weight: "20%", status: "В работе", score: "—", due: "05 мар" },
  { title: "Design critique: UI макет", weight: "15%", status: "На проверке", score: "—", due: "07 мар" },
  { title: "Экзамен по дисциплине", weight: "35%", status: "Готовится", score: "—", due: "15 мар" },
];

export default function GradesPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const CARD_WIDTH = 320;
  const GAP = 16;
  const [gradeGroups, setGradeGroups] = useState<GradeGroup[]>(fallbackGradeGroups);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const { data, error } = await supabase
        .from("grades")
        .select(
          [
            "enrollment_id",
            "score",
            "graded_at",
            "comment",
            "enrollments(course_id, courses(subject_id, subjects:subjects!courses_subject_id_fkey(id, name, code)))",
          ].join(", ")
        )
        .order("graded_at", { ascending: false })
        .limit(300);

      if (error || !data || data.length === 0) {
        return;
      }

      const rows = data as GradeRow[];
      const bySubject = new Map<
        number,
        {
          subjectName: string;
          subjectCode?: string | null;
          enrollmentId: number;
          scores: number[];
          last: { score: number; graded_at: string };
        }
      >();

      rows.forEach((row) => {
        const subjectId = row.enrollments?.courses?.subjects?.id;
        const subjectName = row.enrollments?.courses?.subjects?.name;
        const subjectCode = row.enrollments?.courses?.subjects?.code;

        if (!subjectId || !subjectName) return;

        const existing = bySubject.get(subjectId) ?? {
          subjectName,
          subjectCode,
          enrollmentId: row.enrollment_id,
          scores: [],
          last: { score: Number(row.score), graded_at: row.graded_at },
        };

        existing.scores.push(Number(row.score));

        const isNewer = new Date(row.graded_at).getTime() > new Date(existing.last.graded_at).getTime();
        if (isNewer) {
          existing.last = { score: Number(row.score), graded_at: row.graded_at };
          existing.enrollmentId = row.enrollment_id;
        }

        bySubject.set(subjectId, existing);
      });

      if (bySubject.size === 0) return;

      const groups: GradeGroup[] = Array.from(bySubject.entries()).map(([subjectId, info]) => {
        const avg = info.scores.reduce((s, v) => s + v, 0) / info.scores.length;
        const percent = Math.min(Math.max(Math.round(avg), 0), 100);
        const lastLabel = `${info.last.score} (${gradeToLetter(info.last.score)})`;

        return {
          id: String(info.enrollmentId),
          subject: info.subjectName || `Дисциплина #${subjectId}`,
          grade: gradeToLetter(avg),
          percent,
          description: `Оценок: ${info.scores.length}. Последняя: ${lastLabel}`,
          updated: new Intl.DateTimeFormat("ru-RU", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(info.last.graded_at)),
        };
      });

      setGradeGroups(groups);
    };

    load();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "right" ? CARD_WIDTH + GAP : -(CARD_WIDTH + GAP);
      scrollRef.current.scrollBy({
        left: offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Прогресс обучения</p>
          <h2 className="mt-2 text-3xl font-semibold">
            Динамика оценок по предметам, данные из Supabase.
          </h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
          >
            Обновить Supabase
          </button>
          <Link
            href="/notes"
            className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white"
          >
            Перейти к заметкам
          </Link>
        </div>
      </header>  
      
      <div className="relative flex items-center h-[300px]">
        <div className="absolute left-0 z-20 flex items-center h-full px-4">
          <button
            onClick={() => scroll("left")}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          >
            <ArrowLeft />
          </button>
        </div>

        <div className="mx-[100px] w-full overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto items-stretch scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {gradeGroups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0 w-80 h-full"
              >
                <Link
                  href={`/grades/${group.id}`}
                  className="flex flex-col justify-between h-full rounded-3xl border border-transparent transition hover:-translate-y-1 hover:border-white/20"
                >
                  <Card
                    eyebrow={`Текущая оценка: ${group.grade}`}
                    title={group.subject}
                    description={group.description}
                    percent={group.percent}
                    footer={group.updated}
                    highlight={group.percent > 90 ? "Almost" : "In work"}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute right-0 z-20 flex items-center h-full px-4">
          <button
            onClick={() => scroll("right")}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          >
            <ArrowRight />
          </button>
        </div>
      </div>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold">Разбивка по активностям</h3>
            <span className="text-sm text-slate-400">Пример таблицы нагрузки — заменить на реальные данные из grades_breakdown</span>
          </div>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200"
          >
            Открыть заметки
            <ArrowRight size={16} />
          </Link>
        </div>
        
        <GradesChart />

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-left text-sm text-slate-100">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
              <tr>
                <th className="px-4 py-3">Активность</th>
                <th className="px-4 py-3">Вес</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Оценка</th>
                <th className="px-4 py-3">Дедлайн</th>
              </tr>
            </thead>
            <tbody>
              {breakdownRows.map((row) => (
                <tr key={row.title} className="odd:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{row.title}</td>
                  <td className="px-4 py-3 text-slate-300">{row.weight}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.score}</td>
                  <td className="px-4 py-3 text-slate-300">{row.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
