"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Assignment = {
  id: string;
  title: string;
  description: string;
  deadline?: string;
};

type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string;
  submittedAt: string;
};

type Grade = {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number;
  comment?: string;
  gradedAt: string;
};

export default function TasksPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setAssignments(data);
    })();
  }, []);

  // учитель создаёт задание
  const createTask = async (title: string, description: string, deadline?: string) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, deadline }),
    });
    if (!res.ok) {
      const text = await res.text();
      alert("Ошибка создания задания: " + text);
      return;
    }
    const newTask = await res.json();
    setAssignments((prev) => [...prev, newTask]);
  };

  // студент прикрепляет работу
  const submitWork = async (assignmentId: string, fileUrl: string) => {
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, studentId: "st-001", fileUrl }),
    });
    if (!res.ok) {
      alert("Ошибка отправки работы");
      return;
    }
    alert("Работа отправлена!");
  };

  // учитель ставит оценку
  const setGrade = async (assignmentId: string, studentId: string, score: number, comment?: string) => {
    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, studentId, score, comment }),
    });
    if (!res.ok) {
      alert("Ошибка выставления оценки");
      return;
    }
    alert("Оценка выставлена!");
  };

  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold">Задания</h1>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setRole("student")}
          className={`px-4 py-2 rounded ${role === "student" ? "bg-cyan-500" : "bg-gray-700"}`}
        >
          Студент
        </button>
        <button
          onClick={() => setRole("teacher")}
          className={`px-4 py-2 rounded ${role === "teacher" ? "bg-violet-500" : "bg-gray-700"}`}
        >
          Учитель
        </button>
      </div>

      {role === "teacher" && (
        <div className="mt-4">
          <button
            onClick={() => createTask("Новое задание", "Описание задания", "2025-12-20")}
            className="bg-violet-500 px-4 py-2 rounded"
          >
            Создать задание
          </button>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {assignments.map((a) => (
          <li key={a.id} className="border border-white/20 rounded p-4">
            <h2 className="text-xl font-semibold">{a.title}</h2>
            <p>{a.description}</p>
            <p className="text-sm text-slate-400">Дедлайн: {a.deadline}</p>

            {role === "student" && (
              <button
                onClick={() => submitWork(a.id, "/uploads/demo.png")}
                className="mt-2 bg-cyan-500 px-3 py-1 rounded"
              >
                Прикрепить работу
              </button>
            )}

            {role === "teacher" && (
              <button
                onClick={() => setGrade(a.id, "st-001", 95, "Хорошая работа")}
                className="mt-2 bg-emerald-500 px-3 py-1 rounded"
              >
                Поставить оценку
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
