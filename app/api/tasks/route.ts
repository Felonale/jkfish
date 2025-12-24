import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('id,title,description,deadline,file_path,created_at,created_by')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const tasks =
    data?.map((t) => ({
      ...t,
      file_url: t.file_path
        ? supabase.storage.from('tasks').getPublicUrl(t.file_path).data.publicUrl
        : null,
    })) ?? [];

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, deadline, file_path } = body ?? {};
  if (!title || !description) {
    return NextResponse.json({ error: 'title и description обязательны' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: String(title),
      description: String(description),
      deadline: deadline || null,
      file_path: file_path || null,
      created_by: user.id,
    })
    .select('id,title,description,deadline,file_path,created_at,created_by')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const task = {
    ...data!,
    file_url: data?.file_path
      ? supabase.storage.from('tasks').getPublicUrl(data.file_path).data.publicUrl
      : null,
  };

  return NextResponse.json(task, { status: 201 });
}

