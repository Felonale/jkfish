import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

async function requireTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: teacherRow }, { data: superRow }] = await Promise.all([
    supabase.from('teachers').select('first_name,last_name,middle_name').eq('user_id', user.id).maybeSingle(),
    supabase.from('superadmins').select('user_id').eq('user_id', user.id).maybeSingle(),
  ]);
  if (!teacherRow && !superRow) redirect('/');
  return { teacherRow };
}

export default async function TeacherProfilePage() {
  const { teacherRow } = await requireTeacher();

  return (
    <div className="space-y-4 text-white">
      <h1 className="text-3xl font-semibold">Профиль преподавателя</h1>
      {teacherRow ? (
        <p className="text-slate-300">
          {[teacherRow.last_name, teacherRow.first_name, teacherRow.middle_name].filter(Boolean).join(' ')}
        </p>
      ) : (
        <p className="text-slate-300">Данные преподавателя не заполнены. Можно добавить в разделе админа.</p>
      )}
      <p className="text-slate-400">
        Здесь будет полноценное редактирование преподавательского профиля. Пока — заглушка.
      </p>
    </div>
  );
}

