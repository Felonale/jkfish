import type { ReactNode } from 'react';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-8 lg:px-8">
      {children}
    </div>
  );
}

