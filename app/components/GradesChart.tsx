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
import { useState } from "react";
import { useRouter } from "next/navigation"; // для перехода

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

type DisciplineKey = "math" | "physics" | "programming" | "operating-systems";

interface GradePoint {
  date: string;
  grade: number;
  assignmentId?: string; // добавляем ID задания
}

interface Discipline {
  label: string;
  data: GradePoint[];
}

const disciplines: Record<DisciplineKey, Discipline> = {
  math: {
    label: "Математика для инженеров",
    data: [
      { date: "01 дек", grade: 65, assignmentId: "a1" },
      { date: "02 дек", grade: 90, assignmentId: "a2" },
      { date: "03 дек", grade: 70, assignmentId: "a3" },
      { date: "04 дек", grade: 85, assignmentId: "a4" },
      { date: "05 дек", grade: 90, assignmentId: "a5" },
      { date: "06 дек", grade: 100, assignmentId: "a6" },
    ],
  },
  physics: {
    label: "Физика и моделирование",
    data: [
      { date: "01 дек", grade: 80, assignmentId: "b1" },
      { date: "02 дек", grade: 60, assignmentId: "b2" },
      { date: "03 дек", grade: 90, assignmentId: "b3" },
      { date: "04 дек", grade: 85, assignmentId: "b4" },
      { date: "05 дек", grade: 90, assignmentId: "b5" },
      { date: "06 дек", grade: 92, assignmentId: "b6" },
    ],
  },
  programming: {
    label: "Fullstack‑разработка",
    data: [
      { date: "01 дек", grade: 100, assignmentId: "c1" },
      { date: "02 дек", grade: 85, assignmentId: "c2" },
      { date: "03 дек", grade: 100, assignmentId: "c3" },
      { date: "04 дек", grade: 85, assignmentId: "c4" },
      { date: "05 дек", grade: 90, assignmentId: "c5" },
      { date: "06 дек", grade: 90, assignmentId: "c6"},
    ],
  },
    "operating-systems": {
    label: "Операционные системы",
    data: [
      { date: "01 дек", grade: 75, assignmentId: "d1"},
      { date: "02 дек", grade: 80, assignmentId: "d2" },
      { date: "03 дек", grade: 85, assignmentId: "d3" },
      { date: "04 дек", grade: 20, assignmentId: "d4" },
      { date: "05 дек", grade: 90, assignmentId: "d5" },
      { date: "06 дек", grade: 92, assignmentId: "d6" },
    ],
  },
};

export default function GradesChart() {
  const [selected, setSelected] = useState<DisciplineKey>("math");
  const dataset: GradePoint[] = disciplines[selected].data;
  const router = useRouter();

  const data = {
    labels: dataset.map((d) => d.date),
    datasets: [
      {
        label: disciplines[selected].label,
        data: dataset.map((d) => d.grade),
        borderColor: "#8b5cf6",
        backgroundColor: "#8b5cf6",
        pointBackgroundColor: "#22d3ee",
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
      },
    },
    scales: {
      x: { ticks: { color: "#cbd5e1" }, grid: { color: "#334155" } },
      y: { ticks: { color: "#cbd5e1" }, grid: { color: "#334155" }, min: 0, max: 100 },
    },
    onClick: (event: any, elements: any) => {
      if (!elements.length) return;
      const index = elements[0].index; // индекс точки
      const assignmentId = dataset[index].assignmentId;
      if (assignmentId) {
        router.push(`/tasks?id=${assignmentId}`);
      }
    },
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/70 p-6 text-white">
      <div className="mb-4">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as DisciplineKey)}
          className="rounded-lg bg-violet-600 px-3 py-2 text-white"
        >
          {Object.keys(disciplines).map((key) => (
            <option key={key} value={key}>
              {disciplines[key as DisciplineKey].label}
            </option>
          ))}
        </select>
      </div>
      <Line data={data} options={options} />
    </div>
  );
}
