import { Suspense } from 'react';

import ViewNoteClient from './view-note-client';

export default function ViewNotePage() {
  return (
    <Suspense fallback={<div className="text-white">Загрузка…</div>}>
      <ViewNoteClient />
    </Suspense>
  );
}