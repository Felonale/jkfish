"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  score?: number | null;
  comment?: string | null;
  description?: string | null;
};

const getScoreColor = (score: number) => {
  if (score <= 50) return "text-red-300";
  if (score <= 69) return "text-orange-300";
  if (score <= 89) return "text-yellow-200";
  return "text-emerald-300";
};

export default function TasksPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const signUrl = async (path: string | null): Promise<string | null> => {
    if (!path) return null;
    const { data, error } = await supabase.storage.from("tasks").createSignedUrl(path, 60 * 60);
    if (error) {
      console.error("signUrl error", error.message);
      return null;
    }
    return data?.signedUrl ?? null;
  };

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      // Преподаватели и суперадмины уходят в свой раздел
      const [{ data: teacherRow }, { data: superRow }] = await Promise.all([
        supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle(),
        supabase.from("superadmins").select("user_id").eq("user_id", user.id).maybeSingle(),
      ]);
      if (teacherRow || superRow) {
        router.replace("/teacher/tasks");
        return;
      }

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
        taskRows
          ? await Promise.all(
              taskRows.map(async (t) => ({
                ...t,
                file_url: await signUrl(t.file_path),
              })),
            )
          : [];
      setTasks(tasksWithUrls);

      const { data: subsRows } = await supabase
        .from("task_submissions")
        .select("id,task_id,user_id,file_path,created_at,score,comment,description")
        .eq("user_id", user.id);

      const subs = subsRows
        ? await Promise.all(
            subsRows.map(async (s) => ({
              ...s,
              file_url: await signUrl(s.file_path),
            })),
          )
        : [];

      const byTask: Record<string, Submission[]> = {};
      subs.forEach((s) => {
        byTask[s.task_id] = [...(byTask[s.task_id] ?? []), s];
      });
      setSubmissions(byTask);
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadSubmission = async (task: Task, file: File) => {
    setError(null);
    setUploading(task.id);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const ext = file.name.split(".").pop();
      const path = `submissions/${task.id}/${user.id}-${Date.now()}.${ext ?? "dat"}`;
      const { error: uploadError } = await supabase.storage.from("tasks").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: insertData, error: insertError } = await supabase
        .from("task_submissions")
        .insert({
          task_id: task.id,
          user_id: user.id,
          file_path: path,
          description: notes[task.id]?.trim() || null, // комментарий ученика
          comment: null, // комментарий преподавателя хранится здесь
        })
        .select("id,task_id,user_id,file_path,created_at,score,comment,description")
        .single();

      if (insertError) throw insertError;

      const submission: Submission = {
        ...insertData!,
        file_url: await signUrl(path),
      };

      setSubmissions((prev) => ({
        ...prev,
        [task.id]: [...(prev[task.id] ?? []), submission],
      }));
      setNotes((prev) => ({ ...prev, [task.id]: "" }));
      setFiles((prev) => ({ ...prev, [task.id]: null }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить работу. Попробуйте еще раз.");
    } finally {
      setUploading(null);
    }
  };

  const submitWithFile = async (task: Task, file: File | null | undefined) => {
    if (!file) {
      setError("Выберите файл перед отправкой.");
      return;
    }
    await uploadSubmission(task, file);
  };

  const deleteSubmission = async (sub: Submission) => {
    if (!window.confirm("Точно удалить эту отправку?")) return;
    setDeleting((prev) => ({ ...prev, [sub.id]: true }));
    setError(null);
    try {
      const res = await fetch(`/api/submissions?id=${encodeURIComponent(sub.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t.error ?? "Не удалось удалить отправку");
      }
      setSubmissions((prev) => {
        const list = prev[sub.task_id] ?? [];
        return {
          ...prev,
          [sub.task_id]: list.filter((s) => s.id !== sub.id),
        };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить отправку");
    } finally {
      setDeleting((prev) => ({ ...prev, [sub.id]: false }));
    }
  };

  if (loading) return <div className="text-white">Загрузка...</div>;

  return (
    <main className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-semibold">Задания</h1>
        <p className="text-sm text-slate-300">
          Здесь можно сдавать задания и прикладывать файлы. Файлы хранятся в бакете storage.tasks,
          сами отправки — в таблице task_submissions.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <section className="space-y-4">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Заданий пока нет.
          </div>
        ) : (
          tasks.map((task) => {
            const mySubs = submissions[task.id] ?? [];
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
                            new Date(task.deadline),
                          )
                        : "нет"}
                    </p>
                    <h2 className="text-xl font-semibold">{task.title}</h2>
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
                      Открыть файл
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    value={notes[task.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [task.id]: e.target.value }))}
                    placeholder="Комментарий к работе"
                    className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setFiles((prev) => ({ ...prev, [task.id]: file }));
                      }}
                      disabled={uploading === task.id}
                    />
                    <UploadCloud size={16} />
                    Прикрепить файл
                  </label>
                  {files[task.id] && (
                    <span className="text-xs text-slate-300">Выбран: {files[task.id]?.name}</span>
                  )}
                  <button
                    onClick={() => submitWithFile(task, files[task.id])}
                    disabled={uploading === task.id}
                    className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {uploading === task.id ? "Отправляем..." : "Отправить"}
                  </button>
                  {uploading === task.id && (
                    <span className="text-sm text-slate-400">Загрузка...</span>
                  )}
                </div>

                {mySubs.length > 0 && (
                  <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-slate-200">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      История отправок
                    </p>
                    {mySubs
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                      )
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                        >
                          <span>
                            {new Intl.DateTimeFormat("ru-RU", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(sub.created_at))}
                          </span>
                          <div className="flex flex-col gap-1 text-xs text-slate-200">
                            {sub.score != null && (
                              <span className={getScoreColor(sub.score)}>Оценка: {sub.score}</span>
                            )}
                            {sub.comment && (
                              <span className="text-emerald-200">Комментарий преподавателя: {sub.comment}</span>
                            )}
                            {sub.description && (
                              <span className="text-slate-300">Мой комментарий: {sub.description}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {sub.file_url ? (
                              <a
                                href={sub.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-300 underline underline-offset-4"
                              >
                                Открыть
                              </a>
                            ) : (
                              <span className="text-slate-500">Файл не прикреплен</span>
                            )}
                            <button
                              onClick={() => deleteSubmission(sub)}
                              disabled={deleting[sub.id]}
                              className="rounded-lg border border-red-400/50 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/10 disabled:opacity-60"
                            >
                              {deleting[sub.id] ? "Удаляем..." : "Удалить"}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
