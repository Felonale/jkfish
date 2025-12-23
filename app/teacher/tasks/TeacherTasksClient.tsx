"use client";

import { useEffect, useMemo, useState } from "react";
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

type GradeDraft = {
  score: string;
  comment: string;
  isSaving: boolean;
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

export default function TeacherTasksClient() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState<
    Record<string, Submission[]>
  >({});
  const [gradesByAssignment, setGradesByAssignment] = useState<
    Record<string, Grade[]>
  >({});
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, GradeDraft>>({});
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedDate: "",
    deadline: "",
    link: "",
    attachments: [] as Attachment[],
  });
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const loadAssignments = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    const items: Assignment[] = Array.isArray(data) ? data : [];
    setAssignments(items);

    const submissionsEntries: Record<string, Submission[]> = {};
    const gradesEntries: Record<string, Grade[]> = {};

    await Promise.all(
      items.map(async (assignment) => {
        const [subsRes, gradesRes] = await Promise.all([
          fetch(`/api/submissions?assignmentId=${encodeURIComponent(assignment.id)}`),
          fetch(`/api/grades?assignmentId=${encodeURIComponent(assignment.id)}`),
        ]);
        const subsData = await subsRes.json();
        const gradesData = await gradesRes.json();
        submissionsEntries[assignment.id] = Array.isArray(subsData) ? subsData : [];
        gradesEntries[assignment.id] = Array.isArray(gradesData) ? gradesData : [];
      })
    );

    setSubmissionsByAssignment(submissionsEntries);
    setGradesByAssignment(gradesEntries);
  };

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      await loadAssignments();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateGradeDraft = (key: string, patch: Partial<GradeDraft>) => {
    setGradeDrafts((prev) => {
      const current = prev[key] ?? { score: "", comment: "", isSaving: false };
      return { ...prev, [key]: { ...current, ...patch } };
    });
  };

  const toggleStudent = (key: string) => {
    setExpandedStudents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const createAssignment = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      alert("Заполните название и описание.");
      return;
    }

    const attachments = [...form.attachments];
    if (form.link.trim()) {
      attachments.push({ name: form.link.trim(), url: form.link.trim() });
    }

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim(),
        assignedDate: form.assignedDate || undefined,
        deadline: form.deadline || undefined,
        attachments,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      alert(`Ошибка создания задания: ${text}`);
      return;
    }

    const created = await res.json();
    setAssignments((prev) => [created, ...prev]);
    setSubmissionsByAssignment((prev) => ({ ...prev, [created.id]: [] }));
    setGradesByAssignment((prev) => ({ ...prev, [created.id]: [] }));
    setForm({
      title: "",
      description: "",
      assignedDate: "",
      deadline: "",
      link: "",
      attachments: [],
    });
  };

  const saveGrade = async (assignmentId: string, studentId: string) => {
    const key = `${assignmentId}:${studentId}`;
    const draft = gradeDrafts[key];
    const score = Number(draft?.score);
    if (!Number.isFinite(score)) {
      alert("Введите числовую оценку.");
      return;
    }

    updateGradeDraft(key, { isSaving: true });
    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId,
        studentId,
        score,
        comment: draft?.comment ?? "",
      }),
    });
    updateGradeDraft(key, { isSaving: false });

    if (!res.ok) {
      alert("Ошибка выставления оценки");
      return;
    }
    const grade = await res.json();
    setGradesByAssignment((prev) => {
      const list = prev[assignmentId] ?? [];
      const existingIndex = list.findIndex((g) => g.studentId === studentId);
      if (existingIndex >= 0) {
        const next = [...list];
        next[existingIndex] = grade;
        return { ...prev, [assignmentId]: next };
      }
      return { ...prev, [assignmentId]: [...list, grade] };
    });
  };

  if (loading) {
    return <div className="text-white">Загрузка...</div>;
  }

  return (
    <div className="space-y-8 text-white">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-semibold">Задания преподавателя</h1>
        <p className="text-sm text-slate-300">
          Создавайте задания, принимайте отправки и выставляйте оценки.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Новое задание</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Название"
            className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500"
          />
          <input
            type="date"
            value={form.assignedDate}
            onChange={(event) => setForm((prev) => ({ ...prev, assignedDate: event.target.value }))}
            className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white"
          />
          <input
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Описание"
            className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500 md:col-span-2"
          />
          <input
            type="date"
            value={form.deadline}
            onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))}
            className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white"
          />
          <input
            type="url"
            value={form.link}
            onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
            placeholder="Ссылка на материалы"
            className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white">
            <input
              type="file"
              multiple
              className="hidden"
              onChange={async (event) => {
                const files = await readFiles(event.target.files);
                setForm((prev) => ({ ...prev, attachments: files }));
              }}
            />
            Прикрепить файлы
          </label>
          <span className="text-xs text-slate-400">
            {form.attachments.length ? `Файлов: ${form.attachments.length}` : "Файлы не выбраны"}
          </span>
          <button
            onClick={createAssignment}
            className="ml-auto rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Создать задание
          </button>
        </div>
      </section>

      <section className="space-y-6">
        {assignments.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-200">
            Задания еще не созданы.
          </div>
        ) : (
          assignments.map((assignment) => {
            const submissions = submissionsByAssignment[assignment.id] ?? [];
            const grades = gradesByAssignment[assignment.id] ?? [];
            return (
              <div
                key={assignment.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold">{assignment.title}</h3>
                    <p className="mt-2 text-slate-200">{assignment.description}</p>
                  </div>
                  <div className="text-sm text-slate-300">
                    <p>Назначено: {toLocaleDate(assignment.assignedDate)}</p>
                    <p>Дедлайн: {toLocaleDate(assignment.deadline)}</p>
                  </div>
                </div>

                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {assignment.attachments.map((attachment) => (
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
                )}

                <div className="mt-6 space-y-4">
                  <h4 className="text-sm uppercase tracking-[0.35em] text-slate-300">
                    Отправки студентов
                  </h4>
                  {submissions.length === 0 ? (
                    <p className="text-sm text-slate-400">Отправок пока нет.</p>
                  ) : (
                    (() => {
                      const sorted = submissions
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.submittedAt).getTime() -
                            new Date(a.submittedAt).getTime()
                        );

                      const byStudent = new Map<string, Submission[]>();
                      sorted.forEach((submission) => {
                        const list = byStudent.get(submission.studentId) ?? [];
                        list.push(submission);
                        byStudent.set(submission.studentId, list);
                      });

                      return Array.from(byStudent.entries()).map(([studentId, studentSubs]) => {
                        const studentName = studentSubs[0]?.studentName || studentId;
                        const latest = studentSubs[0];
                        const grade = grades.find((g) => g.studentId === studentId);
                        const key = `${assignment.id}:${studentId}`;
                        const draft = gradeDrafts[key] ?? {
                          score: grade?.score?.toString() ?? "",
                          comment: grade?.comment ?? "",
                          isSaving: false,
                        };
                        const isExpanded = expandedStudents[key] ?? false;

                        return (
                          <div
                            key={studentId}
                            className="rounded-2xl border border-white/10 bg-black/30 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {studentName}
                                </p>
                                <p className="text-xs text-slate-400">
                                  Последняя отправка:{" "}
                                  {new Intl.DateTimeFormat("ru-RU", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  }).format(new Date(latest.submittedAt))}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>Отправок: {studentSubs.length}</span>
                                {grade && (
                                  <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1">
                                    Оценка:{" "}
                                    <span className={gradeColorClass(grade.score)}>
                                      {grade.score}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="mt-2 text-sm text-slate-200">
                              {latest.description || "Без описания."}
                            </p>

                            {latest.attachments && latest.attachments.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {latest.attachments.map((attachment) => (
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

                            <div className="mt-4 grid gap-3 md:grid-cols-[140px_1fr_180px]">
                              <input
                                value={draft.score}
                                onChange={(event) =>
                                  updateGradeDraft(key, { score: event.target.value })
                                }
                                placeholder="Оценка"
                                className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500"
                              />
                              <input
                                value={draft.comment}
                                onChange={(event) =>
                                  updateGradeDraft(key, { comment: event.target.value })
                                }
                                placeholder="Комментарий преподавателя"
                                className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500"
                              />
                              <button
                                onClick={() => saveGrade(assignment.id, studentId)}
                                disabled={draft.isSaving}
                                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                              >
                                {draft.isSaving ? "Сохранение..." : "Сохранить оценку"}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleStudent(key)}
                              className="mt-4 text-xs font-semibold text-cyan-200"
                            >
                              {isExpanded
                                ? "Скрыть все отправки"
                                : "Показать все отправки"}
                            </button>

                            {isExpanded && (
                              <div className="mt-3 space-y-3">
                                {studentSubs.map((submission, index) => (
                                  <div
                                    key={submission.id}
                                    className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-200"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span>Отправка #{studentSubs.length - index}</span>
                                      <span className="text-slate-400">
                                        {new Intl.DateTimeFormat("ru-RU", {
                                          dateStyle: "medium",
                                          timeStyle: "short",
                                        }).format(new Date(submission.submittedAt))}
                                      </span>
                                    </div>
                                    <p className="mt-2">
                                      {submission.description || "Без описания."}
                                    </p>
                                    {submission.attachments &&
                                      submission.attachments.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {submission.attachments.map((attachment) => (
                                            <a
                                              key={attachment.url}
                                              href={attachment.url}
                                              download={attachment.name}
                                              className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-200"
                                            >
                                              {attachment.name}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
