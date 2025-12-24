"use client";

import { useEffect, useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Task = {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  file_path: string | null;
  file_url?: string | null;
  created_at: string;
};

type Submission = {
  id: string;
  task_id: string;
  user_id: string;
  file_path: string | null;
  file_url?: string | null;
  created_at: string;
};

export default function TeacherTasksClient() {
  const supabase = useMemo(() => createClient(), []);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    file: null as File | null,
  });

  const load = async () => {
    setError(null);
    const { data: taskRows, error: taskErr } = await supabase
      .from("tasks")
      .select("id,title,description,deadline,file_path,created_at")
      .order("created_at", { ascending: false });

    if (taskErr) {
      setError(taskErr.message);
      setLoading(false);
      return;
    }

    const tasksWithUrls =
      taskRows?.map((t) => ({
        ...t,
        file_url: t.file_path
          ? supabase.storage.from("tasks").getPublicUrl(t.file_path).data.publicUrl
          : null,
      })) ?? [];
    setTasks(tasksWithUrls);

    const { data: subsRows } = await supabase
      .from("task_submissions")
      .select("id,task_id,user_id,file_path,created_at");

    const subs = (subsRows ?? []).map((s) => ({
      ...s,
      file_url: s.file_path
        ? supabase.storage.from("tasks").getPublicUrl(s.file_path).data.publicUrl
        : null,
    }));

    const byTask: Record<string, Submission[]> = {};
    subs.forEach((s) => {
      byTask[s.task_id] = [...(byTask[s.task_id] ?? []), s];
    });
    setSubmissions(byTask);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createTask = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError("Заполните название и описание");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      let filePath: string | null = null;
      if (form.file) {
        const ext = form.file.name.split(".").pop();
        filePath = `tasks/${crypto.randomUUID()}.${ext ?? "dat"}`;
        const { error: uploadError } = await supabase.storage
          .from("tasks")
          .upload(filePath, form.file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
      }

      const { data, error: insertError } = await supabase
        .from("tasks")
        .insert({
          title: form.title.trim(),
          description: form.description.trim(),
          deadline: form.deadline || null,
          file_path: filePath,
        })
        .select("id,title,description,deadline,file_path,created_at")
        .single();

      if (insertError) throw insertError;

      const newTask: Task = {
        ...data!,
        file_url: filePath
          ? supabase.storage.from("tasks").getPublicUrl(filePath).data.publicUrl
          : null,
      };

      setTasks((prev) => [newTask, ...prev]);
      setForm({ title: "", description: "", deadline: "", file: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать задание");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="text-white">Загрузка…</div>;

  return (
    <div className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-semibold">Задания (преподаватель)</h1>
        <p className="text-sm text-slate-300">
          Создавайте задания, прикрепляйте файлы (хранятся в бакете storage.tasks). Студенты увидят их на своей странице задач и смогут отправлять решения, которые сохраняются как записи в task_submissions + файлы в том же бакете.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Новое задание</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Название"
            className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500"
          />
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
            className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Описание"
            className="md:col-span-2 min-h-[100px] rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold">
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setForm((p) => ({ ...p, file }));
              }}
            />
            <UploadCloud size={16} />
            {form.file ? form.file.name : "Прикрепить файл"}
          </label>
        </div>
        <button
          onClick={createTask}
          disabled={creating}
          className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white"
        >
          {creating ? "Сохраняем…" : "Создать задание"}
        </button>
      </section>

      <section className="space-y-4">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Заданий пока нет.
          </div>
        ) : (
          tasks.map((task) => {
            const subs = submissions[task.id] ?? [];
            return (
              <article
                key={task.id}
                className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                      Дедлайн:{" "}
                      {task.deadline
                        ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(
                            new Date(task.deadline)
                          )
                        : "—"}
                    </p>
                    <h3 className="text-xl font-semibold">{task.title}</h3>
                    <p className="text-sm text-slate-200">{task.description}</p>
                  </div>
                  {task.file_url && (
                    <a
                      href={task.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs text-white"
                    >
                      <UploadCloud size={14} />
                      Материал
                    </a>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Отправки студентов
                  </p>
                  {subs.length === 0 ? (
                    <p className="text-slate-400">Пока нет отправок.</p>
                  ) : (
                    subs
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      )
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-semibold">{sub.user_id}</p>
                            <p className="text-xs text-slate-400">
                              {new Intl.DateTimeFormat("ru-RU", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(sub.created_at))}
                            </p>
                          </div>
                          {sub.file_url ? (
                            <a
                              href={sub.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-300 underline underline-offset-4"
                            >
                              Открыть файл
                            </a>
                          ) : (
                            <span className="text-slate-500">Файл недоступен</span>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
