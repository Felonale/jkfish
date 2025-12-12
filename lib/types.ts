// lib/types.ts
export type Assignment = {
  id: string;
  title: string;
  description: string;
  deadline?: string;
};

export type SubmissionCreate = {
  assignmentId: string;
  studentId: string;
  fileName: string;
  fileUrl?: string; // добавишь при реальной загрузке
};

export type Submission = SubmissionCreate & {
  id: string;
  submittedAt: string;
};

export type GradeCreate = {
  assignmentId: string;
  studentId: string;
  value: number; // 0-100
  comment?: string;
};

export type Grade = GradeCreate & {
  id: string;
  gradedAt: string;
};
