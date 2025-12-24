import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') ?? user.id;
  if (studentId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('task_submissions')
    .select('task_id,user_id,score,comment,created_at')
    .eq('user_id', studentId)
    .not('score', 'is', null)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const grades =
    data?.map((row) => ({
      assignmentId: row.task_id,
      studentId: row.user_id,
      score: Number(row.score),
      gradedAt: row.created_at,
      comment: row.comment ?? undefined,
    })) ?? [];

  return NextResponse.json(grades);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: 'Отсутствует SUPABASE_SERVICE_ROLE_KEY на сервере' },
      { status: 500 }
    );
  }

  const [{ data: teacherRow }, { data: superRow }] = await Promise.all([
    admin.from('teachers').select('id').eq('user_id', user.id).maybeSingle(),
    admin.from('superadmins').select('user_id').eq('user_id', user.id).maybeSingle(),
  ]);
  if (!teacherRow && !superRow) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { submissionId, score, comment } = body ?? {};
  if (!submissionId) {
    return NextResponse.json({ error: 'submissionId обязателен' }, { status: 400 });
  }

  const scoreNumber = score === null || score === undefined ? null : Number(score);
  if (score !== null && score !== undefined && !Number.isFinite(scoreNumber)) {
    return NextResponse.json({ error: 'Некорректная оценка' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('task_submissions')
    .update({ score: scoreNumber, comment: comment ?? null })
    .eq('id', submissionId)
    .select('id,task_id,user_id,file_path,created_at,score,comment')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) {
    return NextResponse.json(
      { error: 'Отправка не найдена или нет прав на обновление' },
      { status: 404 }
    );
  }

  const submission = {
    ...data!,
    file_url: data?.file_path
      ? supabase.storage.from('tasks').getPublicUrl(data.file_path).data.publicUrl
      : null,
  };

  return NextResponse.json(submission);
}

