"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

type SubjectGroup = {
  subjectId: number;
  subjectName: string;
  subjectCode?: string | null;
  enrollmentId: number;
  courseId: number;
  average: number;
  latestScore: number;
  latestDate: string;
  count: number;
};

const gradeToLetter = (score: number) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

export default function GradesInsightsPage() {
  const [groups, setGroups] = useState<SubjectGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
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
      .limit(400);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as GradeRow[];
    const grouped = new Map<number, SubjectGroup>();

    rows.forEach((row) => {
      const subjectId = row.enrollments?.courses?.subjects?.id;
      const subjectName = row.enrollments?.courses?.subjects?.name;
      const subjectCode = row.enrollments?.courses?.subjects?.code;
      const courseId = row.enrollments?.course_id;
      const enrollmentId = row.enrollment_id;

      if (!subjectId || !subjectName || !courseId) return;

      const existing = grouped.get(subjectId) ?? {
        subjectId,
        subjectName,
        subjectCode,
        enrollmentId,
        courseId,
        average: 0,
        latestScore: Number(row.score),
        latestDate: row.graded_at,
        count: 0,
      };

      existing.count += 1;
      existing.average += Number(row.score);

      const isNewer =
        new Date(row.graded_at).getTime() > new Date(existing.latestDate).getTime();
      if (isNewer) {
        existing.latestScore = Number(row.score);
        existing.latestDate = row.graded_at;
        existing.enrollmentId = enrollmentId;
      }

      grouped.set(subjectId, existing);
    });

    const result = Array.from(grouped.values()).map((g) => ({
      ...g,
      average: g.average / g.count,
    }));

    setGroups(result);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    if (groups.length === 0) return null;
    const totalCourses = groups.length;
    const overallAvg =
      groups.reduce((sum, g) => sum + g.average, 0) / Math.max(groups.length, 1);
    const latestDate = groups.reduce(
      (latest, g) =>
        new Date(g.latestDate).getTime() > new Date(latest).getTime()
          ? g.latestDate
          : latest,
      groups[0].latestDate
    );
    return { totalCourses, overallAvg, latestDate };
  }, [groups]);

  return (
    <div className="space-y-8 text-white">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
              Экспериментальная панель оценок
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Grades / Insights</h1>
            <p className="mt-2 text-sm text-slate-300">
              Здесь тестируем идеи, не трогая основную страницу оценок. Данные тянутся из
              Supabase с привязкой к предметам через courses → subjects.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/grades"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white"
            >
              <ArrowLeft size={16} />
              Назад к оценкам
            </Link>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Обновить
            </button>
          </div>
        </div>

        {summary && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-300">Курсов</p>
              <p className="text-2xl font-semibold">{summary.totalCourses}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-300">Средний балл</p>
              <p className="text-2xl font-semibold">
                {summary.overallAvg.toFixed(1)} ({gradeToLetter(summary.overallAvg)})
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-300">Последнее обновление</p>
              <p className="text-2xl font-semibold">
                {new Intl.DateTimeFormat("ru-RU", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(summary.latestDate))}
              </p>
            </div>
          </div>
        )}
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Предметы и курсы</h2>
            <p className="text-sm text-slate-300">
              Каждая карточка — оценки по предмету (взято из связанного subject).
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Загружаем оценки...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">
            Не удалось загрузить данные: {error}
          </div>
        ) : groups.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Нет данных. Добавьте оценки в Supabase и обновите страницу.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {groups.map((g) => (
              <div
                key={g.subjectId}
                className="group flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {g.subjectCode || "SUBJECT"}
                    </p>
                    <h3 className="text-xl font-semibold">{g.subjectName}</h3>
                    <p className="text-sm text-slate-300">Курс #{g.courseId}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
                    <p className="text-xs text-slate-300">Средний балл</p>
                    <p className="text-lg font-semibold">
                      {g.average.toFixed(1)} ({gradeToLetter(g.average)})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm text-slate-200">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Оценок</p>
                    <p className="text-lg font-semibold">{g.count}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Последняя</p>
                    <p className="text-lg font-semibold">
                      {g.latestScore} ({gradeToLetter(g.latestScore)})
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Дата</p>
                    <p className="text-lg font-semibold">
                      {new Intl.DateTimeFormat("ru-RU", {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(g.latestDate))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
                    Enrollment #{g.enrollmentId}
                  </p>
                  <Link
                    href={`/grades/${g.enrollmentId}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40"
                  >
                    Детали
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
