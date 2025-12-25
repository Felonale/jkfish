import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import OnboardingForm from './onboarding-form';

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const [{ data: student }, { data: teacher }, { data: superadmin }] = await Promise.all([
    supabase.from('students').select('inn').eq('user_id', user.id).maybeSingle(),
    supabase.from('teachers').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('superadmins').select('user_id').eq('user_id', user.id).maybeSingle(),
  ]);

  if (student || teacher || superadmin) redirect('/profile');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <OnboardingForm />
    </div>
  );
}

