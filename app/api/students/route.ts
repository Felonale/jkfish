import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: teacherRow }, { data: superRow }] = await Promise.all([
    supabase.from('teachers').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('superadmins').select('user_id').eq('user_id', user.id).maybeSingle(),
  ]);
  if (!teacherRow && !superRow) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids') ?? '';
  const ids = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from('students')
    .select('user_id, Name, Last_Name, Middle_Name')
    .in('user_id', ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows =
    data?.map((row) => ({
      userId: row.user_id,
      name: [row.Last_Name, row.Name, row.Middle_Name].filter(Boolean).join(' '),
    })) ?? [];

  return NextResponse.json(rows);
}
