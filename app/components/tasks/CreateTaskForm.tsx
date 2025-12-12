"use client";

import { useState } from "react";

export function CreateTaskForm({
  onCreate,
}: {
  onCreate: (title: string, description: string, deadline?: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  return (
    <div className="mt-6 border border-slate-700 rounded p-4">
      <h3 className="font-semibold mb-2">Создать новое задание</h3>
      <input
        className="w-full mb-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded"
        placeholder="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full mb-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded"
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="date"
        className="w-full mb-2 px-2 py-1 bg-slate-800 border border-slate-600 rounded"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <button
        className="bg-violet-600 hover:bg-violet-500 px-3 py-1 rounded"
        onClick={() => onCreate(title, description, deadline)}
      >
        Создать
      </button>
    </div>
  );
}
