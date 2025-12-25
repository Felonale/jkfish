import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Сначала войдите в аккаунт.' }, { status: 401 });
    }

    const body = await request.json();
    const innNumber = Number(body?.inn);
    const firstName = String(body?.firstName ?? '').trim();
    const lastName = String(body?.lastName ?? '').trim();
    const middleName = String(body?.middleName ?? '').trim();
    const groupName = String(body?.groupName ?? '').trim();
    const city = String(body?.city ?? '').trim();
    const courseName = String(body?.courseName ?? '').trim();

    if (!Number.isFinite(innNumber) || innNumber <= 0 || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Заполните ИИН, имя и фамилию.' },
        { status: 400 },
      );
    }

    const { error: upsertError } = await supabase.from('students').upsert(
      {
        inn: innNumber,
        Name: firstName,
        Last_Name: lastName,
        Middle_Name: middleName ? middleName : null,
      },
      { onConflict: 'inn' },
    );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }

    const fullName = `${firstName} ${lastName}${middleName ? ` ${middleName}` : ''}`;

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        student_inn: innNumber,
        full_name: fullName,
        group_name: groupName,
        city,
        course_name: courseName,
      },
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('profile update error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось сохранить профиль.' },
      { status: 500 },
    );
  }
}

