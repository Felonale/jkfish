// app/components/tasks/AssignmentCard.tsx
"use client";
import { GradeForm } from "./GradeFrom";
import { UploadForm } from "./UploadFrom";

export function AssignmentCard({
  assignment,
  role,
  submission,
  grade,
  onSubmitWork,
  onSetGrade,
}: {
  assignment: { id: string; title: string; description: string; deadline?: string };
  role: "student" | "teacher";
  submission: { fileName: string; submittedAt: string } | null;
  grade: { value: number; comment?: string; gradedAt: string } | null;
  onSubmitWork: (file: File | null) => void;
  onSetGrade: (value: number, comment: string) => void;
}) {
  return (
    <article id={`assignment-${assignment.id}`} className="border border-slate-800 rounded-lg p-4 bg-slate-900">
      <h2 className="text-lg font-semibold">{assignment.title}</h2>
      <p className="mt-1 opacity-80">{assignment.description}</p>
      {assignment.deadline && <p className="mt-1 text-sm opacity-60">Дедлайн: {assignment.deadline}</p>}

      <div className="mt-4 grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold">Студент</h3>
          {submission ? (
            <div className="mt-2 text-sm">
              <p><span className="opacity-70">Файл:</span> {submission.fileName}</p>
              <p className="opacity-70">Отправлено: {new Date(submission.submittedAt).toLocaleString()}</p>
            </div>
          ) : role === "student" ? (
            <UploadForm onSubmit={onSubmitWork} />
          ) : (
            <p className="text-sm opacity-60">Ожидается отправка студента</p>
          )}

          {grade ? (
            <div className="mt-3 text-sm">
              <p><span className="opacity-70">Оценка:</span> {grade.value}/100</p>
              {grade.comment && <p className="opacity-70">Комментарий: {grade.comment}</p>}
              <p className="opacity-70">Поставлено: {new Date(grade.gradedAt).toLocaleString()}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm opacity-60">Оценка еще не выставлена</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Преподаватель</h3>
          {role === "teacher" ? (
            <GradeForm
              initialValue={grade?.value}
              initialComment={grade?.comment}
              onSubmit={onSetGrade}
              disabled={!submission}
            />
          ) : (
            <p className="text-sm opacity-60">Переключите роль на “Преподаватель”</p>
          )}
        </div>
      </div>
    </article>
  );
}
