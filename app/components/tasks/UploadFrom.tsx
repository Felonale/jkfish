// app/components/tasks/UploadForm.tsx
"use client";
import { useState } from "react";

export function UploadForm({ onSubmit }: { onSubmit: (file: File | null) => void }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="mt-2">
      <label className="block text-sm opacity-80">Прикрепите файл</label>
      <input type="file" className="mt-2 text-sm" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="mt-2 bg-blue-600 hover:bg-blue-500 rounded px-3 py-1 text-sm" onClick={() => onSubmit(file)}>
        Отправить
      </button>
    </div>
  );
}
