import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

async function requireTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: teacherRow }, { data: superRow }] = await Promise.all([
    supabase.from('teachers').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('superadmins').select('user_id').eq('user_id', user.id).maybeSingle(),
  ]);
  if (!teacherRow && !superRow) redirect('/');
}

export default async function TeacherNotesPage() {
  await requireTeacher();

  return (
    <div className="space-y-4 text-white">
      <h1 className="text-3xl font-semibold">Заметки (версия для преподавателя)</h1>
      <p className="text-slate-300">
        Здесь будет раздел заметок/материалов преподавателя. Сейчас — заглушка, доступная только преподавателям.
      </p>
    </div>
  );
}

