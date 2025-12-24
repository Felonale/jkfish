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
};

export default function TasksPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      // если преподаватель/суперадмин — переносим в их версию
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
        taskRows?.map((t) => ({
          ...t,
          file_url: t.file_path
            ? supabase.storage.from("tasks").getPublicUrl(t.file_path).data.publicUrl
            : null,
        })) ?? [];

      setTasks(tasksWithUrls);

      // загрузим мои отправки
      const { data: subsRows } = await supabase
        .from("task_submissions")
        .select("id,task_id,user_id,file_path,created_at")
        .eq("user_id", user.id);

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
        })
        .select("id,task_id,user_id,file_path,created_at")
        .single();

      if (insertError) throw insertError;

      const submission: Submission = {
        ...insertData!,
        file_url: supabase.storage.from("tasks").getPublicUrl(path).data.publicUrl,
      };

      setSubmissions((prev) => ({
        ...prev,
        [task.id]: [...(prev[task.id] ?? []), submission],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить файл");
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="text-white">Загрузка…</div>;

  return (
    <main className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-semibold">Задания</h1>
        <p className="text-sm text-slate-300">
          Посмотрите задания и прикрепите решение файлом. Файлы сохраняются в бакете storage.tasks, записи — в таблицах tasks и task_submissions.
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
            Нет заданий.
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
                            new Date(task.deadline)
                          )
                        : "—"}
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
                      Материал
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadSubmission(task, file);
                        e.target.value = "";
                      }}
                      disabled={uploading === task.id}
                    />
                    <UploadCloud size={16} />
                    Прикрепить файл
                  </label>
                  {uploading === task.id && <span className="text-sm text-slate-400">Загрузка…</span>}
                </div>

                {mySubs.length > 0 && (
                  <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-slate-200">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Мои отправки
                    </p>
                    {mySubs
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
