import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId') ?? undefined;
  const studentId = searchParams.get('studentId') ?? undefined;

  const supabase = await createClient();
  const query = supabase
    .from('task_submissions')
    .select('id,task_id,user_id,file_path,created_at,score,comment');
  if (taskId) query.eq('task_id', taskId);
  if (studentId) query.eq('user_id', studentId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const withUrls =
    data?.map((row) => ({
      ...row,
      file_url: row.file_path
        ? supabase.storage.from('tasks').getPublicUrl(row.file_path).data.publicUrl
        : null,
    })) ?? [];

  return NextResponse.json(withUrls);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { task_id, file_path, description } = body ?? {};
  if (!task_id || !file_path) {
    return NextResponse.json({ error: 'task_id и file_path обязательны' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('task_submissions')
    .insert({
      task_id,
      user_id: user.id,
      file_path,
      comment: description ?? null,
    })
    .select('id,task_id,user_id,file_path,created_at,score,comment')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const submission = {
    ...data!,
    file_url: data?.file_path
      ? supabase.storage.from('tasks').getPublicUrl(data.file_path).data.publicUrl
      : null,
  };

  return NextResponse.json(submission, { status: 201 });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id обязателен' }, { status: 400 });

  // удаляем запись, убеждаемся что владелец
  const { data, error } = await supabase
    .from('task_submissions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .select('file_path')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // удаляем файл из storage (если есть)
  if (data.file_path) {
    await supabase.storage.from('tasks').remove([data.file_path]);
  }

  return NextResponse.json({ success: true });
}
