// app/components/tasks/GradeForm.tsx
"use client";
import { useState } from "react";

export function GradeForm({
  initialValue,
  initialComment,
  onSubmit,
  disabled,
}: {
  initialValue?: number;
  initialComment?: string;
  onSubmit: (value: number, comment: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState<number>(initialValue ?? 0);
  const [comment, setComment] = useState<string>(initialComment ?? "");
  return (
    <div className="mt-2">
      {disabled && <p className="text-xs opacity-60 mb-2">Нельзя поставить оценку, пока нет отправки</p>}
      <label className="block text-sm opacity-80">Баллы (0–100)</label>
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-1 w-full bg-slate-800 border border-slate-700 rounded px-2 py-1"
      />
      <label className="block mt-2 text-sm opacity-80">Комментарий</label>
      <textarea
        value={comment}
        disabled={disabled}
        onChange={(e) => setComment(e.target.value)}
        className="mt-1 w-full bg-slate-800 border border-slate-700 rounded px-2 py-1"
        rows={3}
      />
      <button
        disabled={disabled}
        className={`mt-2 rounded px-3 py-1 text-sm ${disabled ? "bg-slate-700 opacity-60" : "bg-green-600 hover:bg-green-500"}`}
        onClick={() => onSubmit(value, comment)}
      >
        Поставить оценку
      </button>
    </div>
  );
}
