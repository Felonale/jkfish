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

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// Типы для дисциплин
type DisciplineKey = "math" | "physics" | "programming" | "operating-systems";

interface GradePoint {
  date: string;
  grade: number;
}

interface Discipline {
  label: string;
  data: GradePoint[];
}

const disciplines: Record<DisciplineKey, Discipline> = {
  math: {
    label: "Математика для инженеров",
    data: [
      { date: "01 дек", grade: 65 },
      { date: "02 дек", grade: 90 },
      { date: "03 дек", grade: 70 },
      { date: "04 дек", grade: 85 },
      { date: "05 дек", grade: 90 },
      { date: "06 дек", grade: 100 },
    ],
  },
  physics: {
    label: "Физика и моделирование",
    data: [
      { date: "01 дек", grade: 80 },
      { date: "02 дек", grade: 60 },
      { date: "03 дек", grade: 90 },
      { date: "04 дек", grade: 85 },
      { date: "05 дек", grade: 90 },
      { date: "06 дек", grade: 92 },
    ],
  },
  programming: {
    label: "Fullstack‑разработка",
    data: [
      { date: "01 дек", grade: 100 },
      { date: "02 дек", grade: 85 },
      { date: "03 дек", grade: 100 },
      { date: "04 дек", grade: 85 },
      { date: "05 дек", grade: 90 },
      { date: "06 дек", grade: 90},
    ],
  },
    "operating-systems": {
    label: "Операционные системы",
    data: [
      { date: "01 дек", grade: 75 },
      { date: "02 дек", grade: 80 },
      { date: "03 дек", grade: 85 },
      { date: "04 дек", grade: 20 },
      { date: "05 дек", grade: 90 },
      { date: "06 дек", grade: 92 },
    ],
  },
};

export default function GradesChart() {
  const [selected, setSelected] = useState<DisciplineKey>("math");
  const dataset: GradePoint[] = disciplines[selected].data;

  const data = {
    labels: dataset.map((d: GradePoint) => d.date),
    datasets: [
      {
        label: disciplines[selected].label,
        data: dataset.map((d: GradePoint) => d.grade),
        borderColor: "#8b5cf6", // фиолетовый
        backgroundColor: "#8b5cf6",
        pointBackgroundColor: "#22d3ee", // бирюзовые точки
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#e5e7eb" },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        ticks: { color: "#cbd5e1" },
        grid: { color: "#334155" },
      },
      y: {
        ticks: { color: "#cbd5e1" },
        grid: { color: "#334155" },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/70 p-6 text-white">
      <div className="mb-4">
        <select
          value={selected}
          onChange={e => setSelected(e.target.value as DisciplineKey)}
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
