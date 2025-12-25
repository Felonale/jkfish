// lib/store.ts

export type Assignment = {
  id: string;
  title: string;
  description: string;
  assignedDate?: string;
  deadline?: string;
  attachments?: Attachment[];
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  description?: string;
  fileUrl: string;
  attachments?: Attachment[];
  submittedAt: string;
};

export type Grade = {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number;
  comment?: string;
  gradedAt: string;
};

export type Attachment = {
  name: string;
  url: string;
  type?: string;
  size?: number;
};

// Типы для создания
export type AssignmentCreate = {
  title: string;
  description: string;
  assignedDate?: string;
  deadline?: string;
  attachments?: Attachment[];
};

export type SubmissionCreate = {
  assignmentId: string;
  studentId: string;
  studentName?: string;
  description?: string;
  fileUrl: string;
  attachments?: Attachment[];
};

export type GradeCreate = {
  assignmentId: string;
  studentId: string;
  score: number;
  comment?: string;
};

class Store {
  private _assignments: Assignment[] = [];
  private _submissions: Submission[] = [];
  private _grades: Grade[] = [];

  // Получить все задания
  getAssignments(): Assignment[] {
    return this._assignments;
  }

  // Создать новое задание
  createAssignment({ title, description, assignedDate, deadline, attachments }: AssignmentCreate): Assignment {
    const a: Assignment = {
      id: Date.now().toString(),
      title,
      description,
      assignedDate,
      deadline,
      attachments,
    };
    this._assignments.push(a);
    return a;
  }

  // Получить детали задания
  getAssignmentDetail(id: string): Assignment | undefined {
    return this._assignments.find((a) => a.id === id);
  }

  // Создать отправку работы
  createSubmission(s: SubmissionCreate): Submission {
    const sub: Submission = {
      id: Date.now().toString(),
      assignmentId: s.assignmentId,
      studentId: s.studentId,
      studentName: s.studentName,
      description: s.description,
      fileUrl: s.fileUrl,
      attachments: s.attachments,
      submittedAt: new Date().toISOString(),
    };
    this._submissions.push(sub);
    return sub;
  }

  // Поставить оценку
  setGrade(g: GradeCreate): Grade {
    const existing = this._grades.find(
      (grade) => grade.assignmentId === g.assignmentId && grade.studentId === g.studentId
    );
    const now = new Date().toISOString();

    if (existing) {
      existing.score = g.score;
      existing.comment = g.comment;
      existing.gradedAt = now;
      return existing;
    }

    const grade: Grade = {
      id: Date.now().toString(),
      assignmentId: g.assignmentId,
      studentId: g.studentId,
      score: g.score,
      comment: g.comment,
      gradedAt: now,
    };
    this._grades.push(grade);
    return grade;
  }

  // Получить все оценки студента
  getGrades(studentId: string): Grade[] {
    return this._grades.filter((g) => g.studentId === studentId);
  }

  // Получить список отправок
  getSubmissions({
    assignmentId,
    studentId,
  }: {
    assignmentId?: string;
    studentId?: string;
  }): Submission[] {
    return this._submissions.filter((s) => {
      if (assignmentId && s.assignmentId !== assignmentId) return false;
      if (studentId && s.studentId !== studentId) return false;
      return true;
    });
  }

  // Получить отправку студента по заданию
  getSubmission(studentId: string, assignmentId: string): Submission | undefined {
    return this._submissions.find(
      (s) => s.studentId === studentId && s.assignmentId === assignmentId
    );
  }

  // Получить оценку студента по заданию
  getGrade(studentId: string, assignmentId: string): Grade | undefined {
    return this._grades.find(
      (g) => g.studentId === studentId && g.assignmentId === assignmentId
    );
  }

  // Получить оценки по заданию
  getGradesByAssignment(assignmentId: string): Grade[] {
    return this._grades.filter((g) => g.assignmentId === assignmentId);
  }
}

export const store = new Store();
