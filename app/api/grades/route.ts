import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { submissionId, score, comment } = body ?? {};
  if (!submissionId) {
    return NextResponse.json({ error: 'submissionId обязателен' }, { status: 400 });
  }

  const scoreNumber = score === null || score === undefined ? null : Number(score);
  if (score !== null && score !== undefined && !Number.isFinite(scoreNumber)) {
    return NextResponse.json({ error: 'Некорректная оценка' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('task_submissions')
    .update({ score: scoreNumber, comment: comment ?? null })
    .eq('id', submissionId)
    .select('id,task_id,user_id,file_path,created_at,score,comment')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const submission = {
    ...data!,
    file_url: data?.file_path
      ? supabase.storage.from('tasks').getPublicUrl(data.file_path).data.publicUrl
      : null,
  };

  return NextResponse.json(submission);
}

