"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

type GradePoint = {
  dateLabel: string;
  grade: number;
  assignmentId?: string;
  assignmentTitle?: string;
};

type Grade = {
  assignmentId: string;
  studentId: string;
  score: number;
  gradedAt: string;
  comment?: string;
};

type Assignment = {
  id: string;
  title: string;
};

const fallbackPoints: GradePoint[] = [
  { dateLabel: "01 дек", grade: 80, assignmentTitle: "Демо-задание 1" },
  { dateLabel: "03 дек", grade: 90, assignmentTitle: "Демо-задание 2" },
  { dateLabel: "06 дек", grade: 75, assignmentTitle: "Демо-задание 3" },
];

export default function GradesChart() {
  const [points, setPoints] = useState<GradePoint[]>(fallbackPoints);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      setPoints([]);
      const [gradesRes, tasksRes] = await Promise.all([
        fetch(`/api/grades?studentId=${encodeURIComponent(user.id)}`),
        fetch("/api/tasks"),
      ]);
      const gradesData = await gradesRes.json();
      const tasksData = await tasksRes.json();

      const assignments = new Map<string, Assignment>();
      (Array.isArray(tasksData) ? tasksData : []).forEach((task: Assignment) => {
        assignments.set(task.id, task);
      });

      const grades: Grade[] = Array.isArray(gradesData) ? gradesData : [];
      if (grades.length === 0) {
        setPoints([]);
        return;
      }

      const ordered = grades
        .slice()
        .sort(
          (a, b) =>
            new Date(a.gradedAt).getTime() - new Date(b.gradedAt).getTime()
        );

      const latestByDay = new Map<string, Grade>();
      ordered.forEach((grade) => {
        const dt = new Date(grade.gradedAt);
        const dateKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
          dt.getDate(),
        ).padStart(2, "0")}`;
        latestByDay.set(dateKey, grade);
      });

      const nextPoints = Array.from(latestByDay.values())
        .sort(
          (a, b) =>
            new Date(a.gradedAt).getTime() - new Date(b.gradedAt).getTime()
        )
        .map((grade) => {
          const assignment = assignments.get(grade.assignmentId);
          return {
            dateLabel: new Intl.DateTimeFormat("ru-RU", {
              day: "2-digit",
              month: "short",
            }).format(new Date(grade.gradedAt)),
            grade: Number(grade.score),
            assignmentId: grade.assignmentId,
            assignmentTitle: assignment?.title ?? "Задание",
          };
        });

      setPoints(nextPoints);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = {
    labels: points.map((point) => point.dateLabel),
    datasets: [
      {
        label: "Оценки по заданиям",
        data: points.map((point) => point.grade),
        borderColor: "#22d3ee",
        backgroundColor: "#22d3ee",
        pointBackgroundColor: "#f97316",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#e5e7eb" } },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          title: (items: any) => {
            const index = items?.[0]?.dataIndex ?? 0;
            return points[index]?.assignmentTitle ?? "Оценка";
          },
        },
      },
    },
    scales: {
      x: { ticks: { color: "#cbd5e1" }, grid: { color: "#334155" } },
      y: { ticks: { color: "#cbd5e1" }, grid: { color: "#334155" }, min: 0, max: 100 },
    },
    onClick: (_event: any, elements: any) => {
      if (!elements.length) return;
      const index = elements[0].index;
      const assignmentId = points[index]?.assignmentId;
      if (assignmentId) {
        router.push(`/tasks?id=${assignmentId}`);
      }
    },
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/70 p-6 text-white">
      {points.length === 0 ? (
        <p className="text-sm text-slate-300">
          Оценки еще не выставлены.
        </p>
      ) : (
        <Line data={data} options={options} />
      )}
    </div>
  );
}
