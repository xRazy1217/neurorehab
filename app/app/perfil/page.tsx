import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import PerfilClient from './PerfilClient'

export default async function PerfilPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  const { data: patient } = await supabase
    .from('patients')
    .select('diagnosis, notes')
    .eq('id', user.id)
    .single()

  return (
    <PerfilClient
      fullName={profile?.full_name ?? ''}
      email={user.email ?? ''}
      avatarUrl={profile?.avatar_url ?? null}
      diagnosis={patient?.diagnosis ?? null}
      notes={patient?.notes ?? null}
      memberSince={profile?.created_at ?? ''}
    />
  )
}
