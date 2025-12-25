"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Plus, Save, Edit, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Option = { id: number; label: string };

type CourseRow = {
  id: number;
  group_id: number;
  term_id: number;
  subjects: { name: string; code: string | null } | null;
  study_groups: { name: string } | null;
  terms: { name: string } | null;
  hours_total: number | null;
  main_teacher_id: number | null;
  teachers: { first_name: string; last_name: string; middle_name: string | null } | null;
};

type SessionRow = {
  id: number;
  course_id: number;
  starts_at: string;
  session_type: string | null;
  topic: string | null;
  location: string | null;
  status: string | null;
};

type CourseForm = {
  subjectId: string;
  groupId: string;
  termId: string;
  hoursTotal: string;
  teacherId: string;
};

type SessionForm = {
  courseId: string;
  startsAt: string;
  endsAt: string;
  sessionType: string;
  topic: string;
  location: string;
  status: string;
};

type StudentRow = {
  inn: number;
  Name: string;
  Last_Name: string;
  Middle_Name: string | null;
  user_id: string | null;
};

type EnrollmentRow = {
  student_inn: number;
  course_id: number;
  courses: { group_id: number } | null;
};

type TeacherForm = {
  firstName: string;
  lastName: string;
  middleName: string;
  userId: string;
};

const emptyCourseForm: CourseForm = {
  subjectId: "",
  groupId: "",
  termId: "",
  hoursTotal: "",
  teacherId: "",
};

const emptySessionForm: SessionForm = {
  courseId: "",
  startsAt: "",
  endsAt: "",
  sessionType: "lesson",
  topic: "",
  location: "",
  status: "scheduled",
};

const emptyTeacherForm: TeacherForm = {
  firstName: "",
  lastName: "",
  middleName: "",
  userId: "",
};

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Option[]>([]);
  const [groups, setGroups] = useState<Option[]>([]);
  const [terms, setTerms] = useState<Option[]>([]);
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [newGroup, setNewGroup] = useState({ name: "", speciality: "" });
  const [assign, setAssign] = useState({ groupId: "", courseId: "", studentInn: "" });
  const [deletingStudent, setDeletingStudent] = useState<Record<number, boolean>>({});
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [groupFilter, setGroupFilter] = useState<string>("");
  const [editStudent, setEditStudent] = useState<StudentRow | null>(null);
  const [editForm, setEditForm] = useState({
    inn: "",
    Name: "",
    Last_Name: "",
    Middle_Name: "",
    groupId: "",
    courseId: "",
  });

  const [courseForm, setCourseForm] = useState<CourseForm>(emptyCourseForm);
  const [sessionForm, setSessionForm] = useState<SessionForm>(emptySessionForm);
  const [editSessionId, setEditSessionId] = useState<number | null>(null);
  const [teacherForm, setTeacherForm] = useState<TeacherForm>(emptyTeacherForm);

  const load = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    setIsTeacher(false);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr) {
      setError(userErr.message);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data: adminRow, error: adminErr } = await supabase
      .from("superadmins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminErr) {
      setError(adminErr.message);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    if (adminRow) {
      setIsAdmin(true);
    } else {
      // проверим, является ли пользователь преподавателем
      const { data: teacherRow, error: teacherErr } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (teacherErr) {
        setError(teacherErr.message);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsTeacher(Boolean(teacherRow));
      setIsAdmin(false);
      if (!teacherRow) {
        setLoading(false);
        return;
      }
    }

    const [
      { data: subj },
      { data: grp },
      { data: trm },
      { data: tchers },
      { data: studs },
      { data: crs },
      { data: sess, error: sessErr },
      { data: enr },
    ] = await Promise.all([
      supabase.from("subjects").select("id,name,code").order("name", { ascending: true }),
      supabase.from("study_groups").select("id,name").order("name", { ascending: true }),
      supabase.from("terms").select("id,name").order("id", { ascending: true }),
      supabase
        .from("teachers")
        .select("id,first_name,last_name,middle_name,user_id")
        .order("last_name", { ascending: true }),
      supabase
        .from("students")
        .select('inn, Name, Last_Name, Middle_Name, user_id')
        .order("Last_Name", { ascending: true }),
      supabase
        .from("courses")
        .select(
          "id,group_id,term_id,hours_total,main_teacher_id,subjects(name,code),study_groups(name),terms(name),teachers:teachers!courses_main_teacher_id_fkey(first_name,last_name,middle_name)"
        )
        .order("id", { ascending: true })
        .limit(200),
        supabase
          .from("course_sessions")
          .select("id,course_id,starts_at,session_type,topic,location,status")
        .order("starts_at", { ascending: true })
        .limit(200),
      supabase
        .from("enrollments")
        .select("student_inn,course_id,courses!inner(group_id)")
        .limit(500),
      ]);

    const subjectOptions = (subj ?? []).map((s) => ({
      id: s.id,
      label: s.code ? `${s.code} — ${s.name}` : s.name,
    }));
    const groupOptionsFromTable = (grp ?? []).map((g) => ({ id: g.id, label: g.name }));
    const termOptionsFromTable = (trm ?? []).map((t) => ({ id: t.id, label: t.name }));

    const coursesData = (crs ?? []) as unknown as CourseRow[];
    const groupOptionsFromCourses = coursesData.map((c) => ({
      id: c.group_id,
      label: c.study_groups?.name ?? `Группа ${c.group_id}`,
    }));
    const termOptionsFromCourses = coursesData.map((c) => ({
      id: c.term_id,
      label: c.terms?.name ?? `Семестр ${c.term_id}`,
    }));

    const dedup = (items: Option[]) =>
      Array.from(new Map(items.map((i) => [i.id, i])).values());

    setSubjects(subjectOptions);
    setGroups(dedup([...groupOptionsFromTable, ...groupOptionsFromCourses]));
    setTerms(dedup([...termOptionsFromTable, ...termOptionsFromCourses]));
    setTeachers(
      (tchers ?? []).map((t) => ({
        id: t.id,
        label: [t.last_name, t.first_name, t.middle_name].filter(Boolean).join(" "),
      }))
    );
    setStudents((studs ?? []) as StudentRow[]);
    setCourses(coursesData);
    const enrollmentsData = (enr ?? []).map((e: any) => ({
      student_inn: e.student_inn,
      course_id: e.course_id,
      courses: Array.isArray(e.courses) ? e.courses[0] ?? null : e.courses ?? null,
    })) as EnrollmentRow[];
    setEnrollments(enrollmentsData);
    if (sessErr) setError(sessErr.message);
    setSessions((sess ?? []) as SessionRow[]);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCourse = async () => {
    setMessage(null);
    const payload = {
      subject_id: Number(courseForm.subjectId),
      group_id: Number(courseForm.groupId),
      term_id: Number(courseForm.termId),
      hours_total: courseForm.hoursTotal ? Number(courseForm.hoursTotal) : null,
      main_teacher_id: courseForm.teacherId ? Number(courseForm.teacherId) : null,
    };
    const { error } = await supabase.from("courses").insert(payload);
    if (error) {
      setError(error.message);
      return;
    }
    setCourseForm(emptyCourseForm);
    setMessage("Курс создан");
    load();
  };

  const handleUpsertSession = async () => {
    setMessage(null);
    const payload = {
      course_id: Number(sessionForm.courseId),
      starts_at: sessionForm.startsAt,
      ends_at: sessionForm.endsAt || null,
      session_type: sessionForm.sessionType,
      topic: sessionForm.topic || null,
      location: sessionForm.location || null,
      status: sessionForm.status || null,
    };
    const query = supabase.from("course_sessions");
    const { error } = editSessionId
      ? await query.update(payload).eq("id", editSessionId)
      : await query.insert(payload);
    if (error) {
      setError(error.message);
      return;
    }
    setSessionForm(emptySessionForm);
    setEditSessionId(null);
    setMessage("Занятие сохранено");
    load();
  };

  const openEditSession = (row: SessionRow) => {
    setEditSessionId(row.id);
    setSessionForm({
      courseId: String(row.course_id),
      startsAt: row.starts_at.slice(0, 16),
      endsAt: "",
      sessionType: row.session_type || "lesson",
      topic: row.topic || "",
      location: row.location || "",
      status: row.status || "scheduled",
    });
  };

  const handleCreateTeacher = async () => {
    setMessage(null);
    const payload = {
      first_name: teacherForm.firstName,
      last_name: teacherForm.lastName,
      middle_name: teacherForm.middleName || null,
      user_id: teacherForm.userId || null,
    };
    const { error } = await supabase.from("teachers").insert(payload);
    if (error) {
      setError(error.message);
      return;
    }
    setTeacherForm(emptyTeacherForm);
    setMessage("Преподаватель добавлен");
    load();
  };

  const handlePromoteStudent = async (s: StudentRow) => {
    if (!window.confirm("Сделать этого студента преподавателем?")) return;
    setMessage(null);
    const payload = {
      first_name: s.Name,
      last_name: s.Last_Name,
      middle_name: s.Middle_Name,
      user_id: s.user_id,
    };
    const { error } = await supabase.from("teachers").insert(payload);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Студент добавлен в учителя");
    load();
  };

  const handleCreateGroup = async () => {
    setMessage(null);
    if (!newGroup.name.trim()) {
      setError("Введите название группы");
      return;
    }
    const res = await fetch("/api/admin/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroup.name.trim(), speciality: newGroup.speciality }),
    });
    if (!res.ok) {
      const t = await res.json().catch(() => ({}));
      setError(t.error ?? "Не удалось создать группу");
      return;
    }
    setNewGroup({ name: "", speciality: "" });
    setMessage("Группа создана");
    load();
  };

  const handleAssignStudentToGroup = async () => {
    setMessage(null);
    if (!assign.groupId || !assign.courseId || !assign.studentInn) {
      setError("Заполните группу, курс и студента");
      return;
    }
    const payload = {
      student_inn: Number(assign.studentInn),
      course_id: Number(assign.courseId),
      status: "active",
    };
    const { error } = await supabase.from("enrollments").insert(payload);
    if (error) {
      setError(error.message);
      return;
    }
    setAssign({ groupId: "", courseId: "", studentInn: "" });
    setMessage("Студент добавлен в группу (через курс)");
    load();
  };

  const handleDeleteStudent = async (inn: number) => {
    if (!window.confirm("Удалить студента? Это действие необратимо.")) return;
    setDeletingStudent((p) => ({ ...p, [inn]: true }));
    setError(null);
    const { error } = await supabase.from("students").delete().eq("inn", inn);
    if (error) {
      setError(error.message);
      setDeletingStudent((p) => ({ ...p, [inn]: false }));
      return;
    }
    setMessage("Студент удален");
    setDeletingStudent((p) => ({ ...p, [inn]: false }));
    load();
  };

  const handleOpenEdit = (s: StudentRow) => {
    const currentEnrollment = enrollments.find((e) => e.student_inn === s.inn);
    const currentGroupId = currentEnrollment?.courses?.group_id
      ? String(currentEnrollment.courses.group_id)
      : "";
    const currentCourseId = currentEnrollment?.course_id ? String(currentEnrollment.course_id) : "";

    setEditStudent(s);
    setEditForm({
      inn: String(s.inn),
      Name: s.Name,
      Last_Name: s.Last_Name,
      Middle_Name: s.Middle_Name ?? "",
      groupId: currentGroupId,
      courseId: currentCourseId,
    });
  };

  const handleSaveEdit = async () => {
    if (!editStudent) return;
    setMessage(null);
    const { error } = await supabase
      .from("students")
      .update({
        Name: editForm.Name.trim(),
        Last_Name: editForm.Last_Name.trim(),
        Middle_Name: editForm.Middle_Name.trim() || null,
      })
      .eq("inn", editStudent.inn);
    if (error) {
      setError(error.message);
      return;
    }
    // Обновим зачисление: удалим старые и добавим новое, если выбрано
    if (editForm.courseId) {
      const payload = {
        student_inn: Number(editForm.inn),
        course_id: Number(editForm.courseId),
        status: "active" as const,
      };
      // удаляем старые
      await supabase.from("enrollments").delete().eq("student_inn", Number(editForm.inn));
      const { error: enrErr } = await supabase.from("enrollments").insert(payload);
      if (enrErr) {
        setError(enrErr.message);
        return;
      }
    }
    setMessage("Студент обновлен");
    setEditStudent(null);
    load();
  };

  const groupMembersSet = new Set(
    enrollments
      .filter((e) => (groupFilter ? String(e.courses?.group_id) === groupFilter : true))
      .map((e) => e.student_inn)
  );

  const studentsByGroup = students.filter((s) => groupMembersSet.has(s.inn));
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const groupById = new Map(groups.map((g) => [g.id, g.label]));

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return true;
    const text = [s.Name, s.Last_Name, s.Middle_Name ?? "", String(s.inn)].join(" ").toLowerCase();
    return text.includes(q);
  });

  if (isAdmin === false && !isTeacher) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
        Нет доступа. Авторизуйтесь под superadmin или преподавателем (для работы с занятиями).
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Админ-панель</p>
            <h1 className="mt-2 text-3xl font-semibold">Курсы и расписание</h1>
            <p className="mt-2 text-sm text-slate-300">
              Выберите предмет, группу и семестр из списков, создайте курс. Добавляйте занятия через форму ниже.
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Обновить
          </button>
        </div>
        {error && (
          <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            Ошибка: {error}
          </div>
        )}
        {message && (
          <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
            {message}
          </div>
        )}
      </header>

      {isAdmin && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Группы</h2>
              <p className="text-sm text-slate-300">Создавайте учебные группы и смотрите список существующих.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={newGroup.name}
              onChange={(e) => setNewGroup((p) => ({ ...p, name: e.target.value }))}
              placeholder="Название группы"
              className="rounded-xl bg-white/10 p-3 text-white"
            />
            <input
              value={newGroup.speciality}
              onChange={(e) => setNewGroup((p) => ({ ...p, speciality: e.target.value }))}
              placeholder="Специальность (опционально)"
              className="rounded-xl bg-white/10 p-3 text-white"
            />
            <button
              onClick={handleCreateGroup}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-500/80 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Создать группу
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full border-collapse text-left text-sm text-slate-100">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Название</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id} className="odd:bg-white/5">
                    <td className="px-3 py-2">{g.id}</td>
                    <td className="px-3 py-2">{g.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {isAdmin && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Добавить студента в группу (через курс)</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={assign.groupId}
              onChange={(e) => setAssign((p) => ({ ...p, groupId: e.target.value, courseId: "" }))}
              className="rounded-xl bg-white/10 p-3 text-white"
            >
              <option value="">Группа</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-slate-900">
                  {g.label}
                </option>
              ))}
            </select>
            <select
              value={assign.courseId}
              onChange={(e) => setAssign((p) => ({ ...p, courseId: e.target.value }))}
              className="rounded-xl bg-white/10 p-3 text-white"
            >
              <option value="">Курс этой группы</option>
              {courses
                .filter((c) => assign.groupId && String(c.group_id) === assign.groupId)
                .map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.id} — {c.subjects?.name ?? "Без предмета"}
                  </option>
                ))}
            </select>
            <select
              value={assign.studentInn}
              onChange={(e) => setAssign((p) => ({ ...p, studentInn: e.target.value }))}
              className="rounded-xl bg-white/10 p-3 text-white"
            >
              <option value="">Студент</option>
              {students.map((s) => (
                <option key={s.inn} value={s.inn} className="bg-slate-900">
                  {[s.Last_Name, s.Name, s.Middle_Name].filter(Boolean).join(" ")} ({s.inn})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAssignStudentToGroup}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} />
            Добавить
          </button>
        </section>
      )}

      {isAdmin && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Добавить преподавателя</h2>
            </div>
            <input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Поиск по ФИО или ИНН"
              className="rounded-xl bg-white/10 p-3 text-white"
            />
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full border-collapse text-left text-sm text-slate-100">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
                <tr>
              <th className="px-3 py-2">ИНН</th>
              <th className="px-3 py-2">ФИО</th>
              <th className="px-3 py-2">Группа</th>
              <th className="px-3 py-2">Курс</th>
              <th className="px-3 py-2">Действие</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.inn} className="odd:bg-white/5">
                <td className="px-3 py-2">{s.inn}</td>
                <td className="px-3 py-2">
                  {[s.Last_Name, s.Name, s.Middle_Name].filter(Boolean).join(" ")}
                </td>
                <td className="px-3 py-2">
                  {(() => {
                    const enr = enrollments.find((e) => e.student_inn === s.inn);
                    if (!enr) return "-";
                    const gid = enr.courses?.group_id;
                    return gid ? groupById.get(gid) || `Группа ${gid}` : "-";
                  })()}
                </td>
                <td className="px-3 py-2">
                  {(() => {
                    const enr = enrollments.find((e) => e.student_inn === s.inn);
                    if (!enr) return "-";
                    const course = courseById.get(enr.course_id);
                    return course?.subjects?.name || `Курс ${enr.course_id}`;
                  })()}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="rounded-xl border border-white/30 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handlePromoteStudent(s)}
                      className="rounded-xl bg-emerald-500/80 px-3 py-1 text-xs font-semibold text-white"
                    >
                      В учителя
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s.inn)}
                      disabled={deletingStudent[s.inn]}
                      className="rounded-xl bg-red-500/80 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {deletingStudent[s.inn] ? "Удаляем..." : "Удалить"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
      )}

      {isAdmin && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Студенты по группе</h2>
              <p className="text-sm text-slate-300">Выберите группу и смотрите всех зачисленных студентов.</p>
            </div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="rounded-xl bg-white/10 p-3 text-white"
            >
              <option value="">Все группы</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-slate-900">
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full border-collapse text-left text-sm text-slate-100">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
                <tr>
                  <th className="px-3 py-2">ИНН</th>
                  <th className="px-3 py-2">ФИО</th>
                </tr>
              </thead>
              <tbody>
                {(groupFilter ? studentsByGroup : students).map((s) => (
                  <tr key={s.inn} className="odd:bg-white/5">
                    <td className="px-3 py-2">{s.inn}</td>
                    <td className="px-3 py-2">
                      {[s.Last_Name, s.Name, s.Middle_Name].filter(Boolean).join(" ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Редактировать студента</h3>
              <button
                onClick={() => setEditStudent(null)}
                className="rounded-full border border-white/20 px-3 py-1 text-sm"
              >
                Закрыть
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={editForm.Last_Name}
                onChange={(e) => setEditForm((p) => ({ ...p, Last_Name: e.target.value }))}
                placeholder="Фамилия"
                className="rounded-xl bg-white/10 p-3 text-white"
              />
              <input
                value={editForm.Name}
                onChange={(e) => setEditForm((p) => ({ ...p, Name: e.target.value }))}
                placeholder="Имя"
                className="rounded-xl bg-white/10 p-3 text-white"
              />
              <input
                value={editForm.Middle_Name}
                onChange={(e) => setEditForm((p) => ({ ...p, Middle_Name: e.target.value }))}
                placeholder="Отчество"
                className="rounded-xl bg-white/10 p-3 text-white md:col-span-2"
              />
              <select
                value={editForm.groupId}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    groupId: e.target.value,
                    courseId: "",
                  }))
                }
                className="rounded-xl bg-white/10 p-3 text-white"
              >
                <option value="">Группа</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-slate-900">
                    {g.label}
                  </option>
                ))}
              </select>
              <select
                value={editForm.courseId}
                onChange={(e) => setEditForm((p) => ({ ...p, courseId: e.target.value }))}
                className="rounded-xl bg-white/10 p-3 text-white"
              >
                <option value="">Курс</option>
                {courses
                  .filter((c) => !editForm.groupId || String(c.group_id) === editForm.groupId)
                  .map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">
                      {c.id} — {c.subjects?.name ?? "Без предмета"}
                    </option>
                  ))}
              </select>
              <input
                value={editForm.inn}
                disabled
                className="rounded-xl bg-white/5 p-3 text-white md:col-span-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white"
              >
                <Save size={16} />
                Сохранить
              </button>
              <button
                onClick={() => setEditStudent(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Создать курс</h2>
            <p className="text-sm text-slate-300">Выберите предмет, группу и семестр.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            value={courseForm.subjectId}
            onChange={(e) => setCourseForm((p) => ({ ...p, subjectId: e.target.value }))}
            className="rounded-xl bg-white/10 p-3 text-white"
          >
            <option value="">Предмет</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900">
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={courseForm.groupId}
            onChange={(e) => setCourseForm((p) => ({ ...p, groupId: e.target.value }))}
            className="rounded-xl bg-white/10 p-3 text-white"
          >
            <option value="">Группа</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id} className="bg-slate-900">
                {g.label}
              </option>
            ))}
          </select>
          <select
            value={courseForm.termId}
            onChange={(e) => setCourseForm((p) => ({ ...p, termId: e.target.value }))}
            className="rounded-xl bg-white/10 p-3 text-white"
          >
            <option value="">Семестр</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900">
                {t.label}
              </option>
            ))}
          </select>
          <input
            value={courseForm.hoursTotal}
            onChange={(e) => setCourseForm((p) => ({ ...p, hoursTotal: e.target.value }))}
            placeholder="Часы всего (опционально)"
            className="rounded-xl bg-white/10 p-3 text-white"
          />
          <select
            value={courseForm.teacherId}
            onChange={(e) => setCourseForm((p) => ({ ...p, teacherId: e.target.value }))}
            className="rounded-xl bg-white/10 p-3 text-white"
          >
            <option value="">Преподаватель (опционально)</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900">
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <button
            onClick={handleCreateCourse}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-500/80 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} />
            Создать курс
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-left text-sm text-slate-100">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Предмет</th>
                <th className="px-3 py-2">Группа</th>
                <th className="px-3 py-2">Семестр</th>
                <th className="px-3 py-2">Преподаватель</th>
                <th className="px-3 py-2">Часы</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="odd:bg-white/5">
                  <td className="px-3 py-2">{c.id}</td>
                  <td className="px-3 py-2">{c.subjects?.name}</td>
                  <td className="px-3 py-2">{c.study_groups?.name || c.group_id}</td>
                  <td className="px-3 py-2">{c.terms?.name || c.term_id}</td>
                  <td className="px-3 py-2">
                    {c.teachers
                      ? [c.teachers.last_name, c.teachers.first_name, c.teachers.middle_name].filter(Boolean).join(" ")
                      : c.main_teacher_id || "—"}
                  </td>
                  <td className="px-3 py-2">{c.hours_total ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {(isAdmin || isTeacher) && (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Занятия (course_sessions)</h2>
            <p className="text-sm text-slate-300">Добавьте или отредактируйте занятие.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            value={sessionForm.courseId}
            onChange={(e) => setSessionForm((p) => ({ ...p, courseId: e.target.value }))}
            className="rounded-xl bg-white/10 p-3 text-white"
          >
            <option value="">Курс</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900">
                {c.id} — {c.subjects?.name ?? "Без предмета"}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={sessionForm.startsAt}
            onChange={(e) => setSessionForm((p) => ({ ...p, startsAt: e.target.value }))}
            className="rounded-xl bg-white/10 p-3 text-white"
          />
          <input
            type="datetime-local"
            value={sessionForm.endsAt}
            onChange={(e) => setSessionForm((p) => ({ ...p, endsAt: e.target.value }))}
            className="rounded-xl bg-white/10 p-3 text-white"
          />
          <select
            value={sessionForm.sessionType}
            onChange={(e) => setSessionForm((p) => ({ ...p, sessionType: e.target.value }))}
            className="rounded-xl bg-white/10 p-3 text-white"
          >
            {[
              { value: "lesson", label: "Занятие" },
              { value: "lecture", label: "Лекция" },
              { value: "lab", label: "Лабораторная" },
              { value: "exam", label: "Экзамен" },
              { value: "consultation", label: "Консультация" },
              { value: "other", label: "Другое" },
            ].map((type) => (
              <option key={type.value} value={type.value} className="bg-slate-900">
                {type.label}
              </option>
            ))}
          </select>
          <input
            value={sessionForm.topic}
            onChange={(e) => setSessionForm((p) => ({ ...p, topic: e.target.value }))}
            placeholder="Тема"
            className="rounded-xl bg-white/10 p-3 text-white"
          />
          <input
            value={sessionForm.location}
            onChange={(e) => setSessionForm((p) => ({ ...p, location: e.target.value }))}
            placeholder="Место"
            className="rounded-xl bg-white/10 p-3 text-white"
          />
          <select
            value={sessionForm.status}
            onChange={(e) => setSessionForm((p) => ({ ...p, status: e.target.value }))}
            className="rounded-xl bg-white/10 p-3 text-white"
          >
            {[
              { value: "scheduled", label: "Запланировано" },
              { value: "completed", label: "Проведено" },
              { value: "cancelled", label: "Отменено" },
              { value: "moved", label: "Перенесено" },
            ].map((st) => (
              <option key={st.value} value={st.value} className="bg-slate-900">
                {st.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleUpsertSession}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/80 px-4 py-2 text-sm font-semibold text-white"
          >
            {editSessionId ? <Save size={16} /> : <Plus size={16} />}
            {editSessionId ? "Сохранить изменения" : "Создать занятие"}
          </button>
          {editSessionId && (
            <button
              onClick={() => {
                setEditSessionId(null);
                setSessionForm(emptySessionForm);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white"
            >
              <X size={16} />
              Отмена
            </button>
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-left text-sm text-slate-100">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Курс</th>
                <th className="px-3 py-2">Начало</th>
                <th className="px-3 py-2">Тип</th>
                <th className="px-3 py-2">Тема</th>
                <th className="px-3 py-2">Статус</th>
                <th className="px-3 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="odd:bg-white/5">
                  <td className="px-3 py-2">{s.id}</td>
                  <td className="px-3 py-2">{s.course_id}</td>
                  <td className="px-3 py-2">
                    {new Date(s.starts_at).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-2">{s.session_type}</td>
                  <td className="px-3 py-2">{s.topic}</td>
                  <td className="px-3 py-2">{s.status}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => openEditSession(s)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/30 px-2 py-1 text-xs text-white"
                    >
                      <Edit size={14} />
                      Править
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}
    </div>
  );
}
