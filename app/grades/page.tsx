"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type ActivityRow = {
  title: string;
  weight: string;
  status: "Сдано" | "На проверке" | "Не сдано" | "Дедлайн прошел";
  score: string;
  due: string;
};

type TaskRow = {
  id: string;
  title: string;
  deadline: string | null;
  created_at: string;
};

type SubmissionRow = {
  id: string;
  task_id: string;
  created_at: string;
  score: number | null;
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

export default function GradesPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const CARD_WIDTH = 320;
  const GAP = 16;
  const [gradeGroups, setGradeGroups] = useState<GradeGroup[]>(fallbackGradeGroups);
  const [activityRows, setActivityRows] = useState<ActivityRow[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      // Если преподаватель или суперадмин — отправляем в их версию страницы
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [{ data: teacherRow }, { data: superRow }] = await Promise.all([
          supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle(),
          supabase.from("superadmins").select("user_id").eq("user_id", user.id).maybeSingle(),
        ]);
        if (teacherRow || superRow) {
          router.replace("/teacher/grades");
          return;
        }

        const [{ data: taskRows }, { data: submissionRows }] = await Promise.all([
          supabase
            .from("tasks")
            .select("id,title,deadline,created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("task_submissions")
            .select("id,task_id,created_at,score")
            .eq("user_id", user.id),
        ]);

        const tasks = (taskRows ?? []) as TaskRow[];
        const submissions = (submissionRows ?? []) as SubmissionRow[];
        const byTask = new Map<string, SubmissionRow[]>();
        submissions.forEach((sub) => {
          byTask.set(sub.task_id, [...(byTask.get(sub.task_id) ?? []), sub]);
        });

        const nextActivityRows: ActivityRow[] = tasks.map((task) => {
          const list = byTask.get(task.id) ?? [];
          const latest = list
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          const deadlinePassed =
            task.deadline &&
            Date.now() > new Date(task.deadline).getTime() + 24 * 60 * 60 * 1000;
          const status = latest
            ? latest.score == null
              ? "На проверке"
              : "Сдано"
            : deadlinePassed
              ? "Дедлайн прошел"
              : "Не сдано";
          const score =
            latest?.score != null
              ? `${latest.score}/100`
              : latest
                ? "—/100"
                : "0/100";
          const due = task.deadline
            ? new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short" }).format(
                new Date(task.deadline)
              )
            : "—";
          return {
            title: task.title,
            weight: "—",
            status,
            score,
            due,
          };
        });
        setActivityRows(nextActivityRows);
      }

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

      const rows = data as unknown as GradeRow[];
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

        const isNewer =
          new Date(row.graded_at).getTime() >
          new Date(existing.last.graded_at).getTime();

        if (isNewer) {
          existing.last = { score: Number(row.score), graded_at: row.graded_at };
          existing.enrollmentId = row.enrollment_id;
        }

        bySubject.set(subjectId, existing);
      });

      if (bySubject.size === 0) return;

      const groups: GradeGroup[] = Array.from(bySubject.entries()).map(
        ([subjectId, info]) => {
          const avg =
            info.scores.reduce((s, v) => s + v, 0) / info.scores.length;

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
        }
      );

      setGradeGroups(groups);
    };

    load();
  }, [router]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset =
        direction === "right" ? CARD_WIDTH + GAP : -(CARD_WIDTH + GAP);

      scrollRef.current.scrollBy({
        left: offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex flex-wrap justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
            Прогресс обучения
          </p>
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

      {/* КАРУСЕЛЬ */}
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

      {/* СЕКЦИЯ РАЗБИВКИ */}
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold">Разбивка по активностям</h3>
            <span className="text-sm text-slate-400">
              Пример таблицы нагрузки — заменить на реальные данные из
              grades_breakdown
            </span>
          </div>

          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200"
          >
            Открыть заметки
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* ГРАФИК */}
        <GradesChart />

        {/* ТАБЛИЦА */}
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
              {activityRows.length === 0 ? (
                <tr className="odd:bg-white/5">
                  <td className="px-4 py-3 text-slate-300" colSpan={5}>
                    Активности пока не найдены.
                  </td>
                </tr>
              ) : (
                activityRows.map((row) => (
                <tr key={row.title} className="odd:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">
                    {row.title}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.weight}</td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        row.status === "Сдано"
                          ? "rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100"
                          : row.status === "На проверке"
                            ? "rounded-full border border-yellow-300/40 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-100"
                            : row.status === "Дедлайн прошел"
                              ? "rounded-full border border-red-300/40 bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-100"
                              : "rounded-full border border-slate-400/40 bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-200"
                      }
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-300">{row.score}</td>
                  <td className="px-4 py-3 text-slate-300">{row.due}</td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
