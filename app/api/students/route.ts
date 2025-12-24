import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
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

  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids') ?? '';
  const ids = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const { data, error } = await admin
    .from('students')
    .select('user_id, Name, Last_Name, Middle_Name')
    .in('user_id', ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows =
    data?.map((row) => ({
      userId: row.user_id,
      name: [row.Last_Name, row.Name, row.Middle_Name].filter(Boolean).join(' '),
    })) ?? [];

  const known = new Set(rows.map((r) => r.userId));
  const missing = ids.filter((id) => !known.has(id));

  if (missing.length > 0) {
    const innById = new Map<string, number>();
    const metaById = new Map<string, { name?: string; email?: string }>();

    for (const id of missing) {
      const { data: userData } = await admin.auth.admin.getUserById(id);
      const metadata = userData?.user?.user_metadata ?? {};
      const metaInn = Number(metadata?.student_inn);
      if (Number.isFinite(metaInn) && metaInn > 0) {
        innById.set(id, metaInn);
      }
      metaById.set(id, {
        name: typeof metadata?.full_name === 'string' ? metadata.full_name : undefined,
        email: userData?.user?.email ?? undefined,
      });
    }

    const innList = Array.from(new Set(Array.from(innById.values())));
    if (innList.length > 0) {
      const { data: innRows, error: innErr } = await admin
        .from('students')
        .select('inn, Name, Last_Name, Middle_Name')
        .in('inn', innList);

      if (!innErr && Array.isArray(innRows)) {
        const nameByInn = new Map<number, string>();
        innRows.forEach((row) => {
          const name = [row.Last_Name, row.Name, row.Middle_Name].filter(Boolean).join(' ');
          if (row.inn) nameByInn.set(row.inn, name);
        });
        innById.forEach((inn, id) => {
          const name = nameByInn.get(inn);
          if (name) {
            rows.push({ userId: id, name });
          }
        });
      }
    }

    const knownAfterInn = new Set(rows.map((r) => r.userId));
    for (const id of missing) {
      if (knownAfterInn.has(id)) continue;
      const meta = metaById.get(id);
      if (meta?.name || meta?.email) {
        rows.push({ userId: id, name: meta.name ?? meta.email ?? 'Студент' });
      }
    }
  }

  return NextResponse.json(rows);
}
