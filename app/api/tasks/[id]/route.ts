import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('id,title,description,deadline,file_path,created_at,created_by')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const task = {
    ...data,
    file_url: data.file_path
      ? supabase.storage.from('tasks').getPublicUrl(data.file_path).data.publicUrl
      : null,
  };

  return NextResponse.json(task);
}

