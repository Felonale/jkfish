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

    const { name, email, phone, location, cohort, track } = await request.json();

    const updates: Parameters<typeof supabase.auth.updateUser>[0] = {
      data: {
        full_name: name,
        phone,
        location,
        cohort,
        track,
      },
    };

    if (email && email !== user.email) {
      updates.email = email;
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
