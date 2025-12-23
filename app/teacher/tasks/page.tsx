import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import TeacherTasksClient from './TeacherTasksClient';

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

export default async function TeacherTasksPage() {
  await requireTeacher();

  return <TeacherTasksClient />;
}

