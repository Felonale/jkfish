"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Attachment = {
  name: string;
  url: string;
  type?: string;
  size?: number;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  assignedDate?: string;
  deadline?: string;
  attachments?: Attachment[];
};

type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  description?: string;
  fileUrl: string;
  attachments?: Attachment[];
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

type SubmissionDraft = {
  description: string;
  link: string;
  attachments: Attachment[];
  isSubmitting: boolean;
};

const toLocaleDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU").format(date);
};

const gradeColorClass = (score: number) => {
  if (score <= 50) return "text-red-400";
  if (score <= 69) return "text-orange-400";
  if (score <= 89) return "text-lime-300";
  return "text-emerald-400";
};

const readFiles = async (files: FileList | null): Promise<Attachment[]> => {
  if (!files || files.length === 0) return [];
  const items = Array.from(files);
  const results = await Promise.all(
    items.map(
      (file) =>
        new Promise<Attachment>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.name,
              url: String(reader.result || ""),
              type: file.type,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        })
    )
  );
  return results;
};

export default function TasksPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [drafts, setDrafts] = useState<Record<string, SubmissionDraft>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [{ data: teacherRow }, { data: superRow }] = await Promise.all([
          supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle(),
          supabase.from("superadmins").select("user_id").eq("user_id", user.id).maybeSingle(),
        ]);
        if (teacherRow || superRow) {
          router.replace("/teacher/tasks");
          return;
        }
        setUserId(user.id);
        setUserName(
          user.user_metadata?.full_name ?? user.email ?? user.id
        );
      }

      const tasksRes = await fetch("/api/tasks");
      const tasksData = await tasksRes.json();
      setAssignments(Array.isArray(tasksData) ? tasksData : []);

      if (user) {
        const [subsRes, gradesRes] = await Promise.all([
          fetch(`/api/submissions?studentId=${encodeURIComponent(user.id)}`),
          fetch(`/api/grades?studentId=${encodeURIComponent(user.id)}`),
        ]);
        const subsData = await subsRes.json();
        const gradesData = await gradesRes.json();
        setSubmissions(Array.isArray(subsData) ? subsData : []);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (loading || assignments.length === 0) return;
    const assignmentId = searchParams.get("id");
    if (!assignmentId) return;
    const element = document.getElementById(`assignment-${assignmentId}`);
    if (!element) return;
    setTimeout(() => {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [assignments.length, loading, searchParams]);

  const submissionByAssignment = useMemo(() => {
    const map = new Map<string, Submission>();
    submissions.forEach((s) => {
      const existing = map.get(s.assignmentId);
      if (!existing) {
        map.set(s.assignmentId, s);
        return;
      }
      const existingTime = new Date(existing.submittedAt).getTime();
      const currentTime = new Date(s.submittedAt).getTime();
      if (currentTime > existingTime) {
        map.set(s.assignmentId, s);
      }
    });
    return map;
  }, [submissions]);

  const gradeByAssignment = useMemo(() => {
    const map = new Map<string, Grade>();
    grades.forEach((g) => {
      const existing = map.get(g.assignmentId);
      if (!existing) {
        map.set(g.assignmentId, g);
        return;
      }
      const existingTime = new Date(existing.gradedAt).getTime();
      const currentTime = new Date(g.gradedAt).getTime();
      if (currentTime > existingTime) {
        map.set(g.assignmentId, g);
      }
    });
    return map;
  }, [grades]);

  const updateDraft = (assignmentId: string, patch: Partial<SubmissionDraft>) => {
    setDrafts((prev) => {
      const current = prev[assignmentId] ?? {
        description: "",
        link: "",
        attachments: [],
        isSubmitting: false,
      };
      return {
        ...prev,
        [assignmentId]: { ...current, ...patch },
      };
    });
  };

  const submitWork = async (assignmentId: string) => {
    if (!userId) {
      alert("Войдите в аккаунт, чтобы отправить работу.");
      return;
    }
    const draft = drafts[assignmentId];
    const link = draft?.link?.trim();
    const attachments = [...(draft?.attachments ?? [])];
    if (link) {
      attachments.push({ name: link, url: link });
    }
    if (attachments.length === 0) {
      alert("Добавьте файл или ссылку.");
      return;
    }
    updateDraft(assignmentId, { isSubmitting: true });

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId,
        studentId: userId,
        studentName: userName,
        description: draft?.description ?? "",
        fileUrl: attachments[0].url,
        attachments,
      }),
    });

    updateDraft(assignmentId, { isSubmitting: false });

    if (!res.ok) {
      alert("Ошибка отправки работы");
      return;
    }
    const submission = await res.json();
    setSubmissions((prev) => [...prev, submission]);
    updateDraft(assignmentId, { description: "", link: "", attachments: [] });
  };

  if (loading) {
    return <div className="text-white">Загрузка...</div>;
  }

  return (
    <main className="space-y-6 text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div>
          <h1 className="text-3xl font-semibold">Задания</h1>
          <p className="text-sm text-slate-300">
            Отправляйте работу, смотрите оценку и комментарий преподавателя.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-slate-200">
          Студент: {userName || "Гость"}
        </div>
      </header>

      {assignments.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-200">
          Пока нет заданий. Загляните позже.
        </div>
      ) : (
        <ul className="space-y-6">
          {assignments.map((a) => {
            const submission = submissionByAssignment.get(a.id);
            const grade = gradeByAssignment.get(a.id);
            const draft = drafts[a.id];
            return (
              <li
                key={a.id}
                id={`assignment-${a.id}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{a.title}</h2>
                    <p className="mt-2 text-slate-200">{a.description}</p>
                  </div>
                  <div className="text-sm text-slate-300">
                    <p>Назначено: {toLocaleDate(a.assignedDate)}</p>
                    <p>Дедлайн: {toLocaleDate(a.deadline)}</p>
                  </div>
                </div>

                {a.attachments && a.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
                      Материалы
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {a.attachments.map((attachment) => (
                        <a
                          key={attachment.url}
                          href={attachment.url}
                          download={attachment.name}
                          className="rounded-full border border-white/20 px-3 py-1 text-xs text-white"
                        >
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <h3 className="text-sm uppercase tracking-[0.35em] text-slate-300">
                      Отправка
                    </h3>
                    {submission ? (
                      <div className="mt-3 space-y-2 text-sm text-slate-200">
                        <p>
                          Последняя отправка:{" "}
                          {new Intl.DateTimeFormat("ru-RU", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(submission.submittedAt))}
                        </p>
                        <p>{submission.description || "Без описания"}</p>
                        {submission.attachments && submission.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {submission.attachments.map((attachment) => (
                              <a
                                key={attachment.url}
                                href={attachment.url}
                                download={attachment.name}
                                className="rounded-full border border-cyan-300/40 px-3 py-1 text-xs text-cyan-100"
                              >
                                {attachment.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-300">
                        Пока нет отправки.
                      </p>
                    )}

                    <div className="mt-4 space-y-3">
                      <textarea
                        value={draft?.description ?? ""}
                        onChange={(event) =>
                          updateDraft(a.id, { description: event.target.value })
                        }
                        placeholder="Короткое описание работы"
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500"
                        rows={3}
                      />
                      <input
                        type="url"
                        value={draft?.link ?? ""}
                        onChange={(event) => updateDraft(a.id, { link: event.target.value })}
                        placeholder="Ссылка на файл (если загружено в облако)"
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500"
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="cursor-pointer rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white">
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={async (event) => {
                              const files = await readFiles(event.target.files);
                              updateDraft(a.id, { attachments: files });
                            }}
                          />
                          Выбрать файлы
                        </label>
                        <span className="text-xs text-slate-400">
                          {draft?.attachments?.length
                            ? `Файлов: ${draft.attachments.length}`
                            : "Файлы не выбраны"}
                        </span>
                      </div>
                      <button
                        onClick={() => submitWork(a.id)}
                        className="w-full rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white"
                        disabled={draft?.isSubmitting}
                      >
                        {draft?.isSubmitting ? "Отправка..." : "Отправить работу"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <h3 className="text-sm uppercase tracking-[0.35em] text-slate-300">
                      Оценка
                    </h3>
                    {grade ? (
                      <div className="mt-4 space-y-2">
                        <div className={`text-4xl font-semibold ${gradeColorClass(grade.score)}`}>
                          {grade.score}
                        </div>
                        <p className="text-sm text-slate-200">
                          {grade.comment || "Комментарий не оставлен."}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Intl.DateTimeFormat("ru-RU", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(grade.gradedAt))}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-300">
                        Оценка пока не выставлена.
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
