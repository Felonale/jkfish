import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { inn, firstName, lastName, middleName, groupName, city, courseName } = await request.json();
    const innNumber = Number(inn);

    if (!innNumber || !firstName || !lastName) {
      return NextResponse.json({ error: 'Заполните ИНН, имя и фамилию' }, { status: 400 });
    }

    const { error: upsertError } = await supabase.from('students').upsert({
      inn: innNumber,
      Name: firstName,
      Last_Name: lastName,
      Middle_Name: middleName || null,
    });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }

    const fullName = `${firstName} ${lastName}${middleName ? ` ${middleName}` : ''}`;

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        student_inn: innNumber,
        full_name: fullName,
        group_name: groupName ?? '',
        city: city ?? '',
        course_name: courseName ?? '',
      },
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('profile update error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось обновить профиль' },
      { status: 500 },
    );
  }
}
