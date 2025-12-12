// lib/store.ts

export type Assignment = {
  id: string;
  title: string;
  description: string;
  deadline?: string;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string;
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

// Типы для создания
export type AssignmentCreate = {
  title: string;
  description: string;
  deadline?: string;
};

export type SubmissionCreate = {
  assignmentId: string;
  studentId: string;
  fileUrl: string;
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
  createAssignment({ title, description, deadline }: AssignmentCreate): Assignment {
    const a: Assignment = {
      id: Date.now().toString(),
      title,
      description,
      deadline,
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
      fileUrl: s.fileUrl,
      submittedAt: new Date().toISOString(),
    };
    this._submissions.push(sub);
    return sub;
  }

  // Поставить оценку
  setGrade(g: GradeCreate): Grade {
    const grade: Grade = {
      id: Date.now().toString(),
      assignmentId: g.assignmentId,
      studentId: g.studentId,
      score: g.score,
      comment: g.comment,
      gradedAt: new Date().toISOString(),
    };
    this._grades.push(grade);
    return grade;
  }

  // Получить все оценки студента
  getGrades(studentId: string): Grade[] {
    return this._grades.filter((g) => g.studentId === studentId);
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
}

export const store = new Store();
