import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Query patients separately — avoids FK join issues with RLS
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id, active, diagnosis, created_at, therapist_id')
    .eq('therapist_id', user.id)
    .order('created_at', { ascending: false })

  if (patientsError) {
    console.error('patients query error:', patientsError)
  }

  const patientIds = (patients ?? []).map(p => p.id)

  // Get profiles for those patients
  const profilesMap: Record<string, { full_name: string; avatar_url: string | null }> = {}
  if (patientIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', patientIds)

    if (profilesError) {
      console.error('profiles query error:', profilesError)
    }

    for (const p of (profiles ?? [])) {
      profilesMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }
    }
  }

  // Get progress data
  const progressMap: Record<string, number> = {}
  const lastActivityMap: Record<string, string> = {}

  if (patientIds.length > 0) {
    const { data: allProgress } = await supabase
      .from('progress_daily')
      .select('patient_id, date, percentage, area')
      .in('patient_id', patientIds)
      .order('date', { ascending: false })

    const byPatient: Record<string, typeof allProgress> = {}
    for (const p of (allProgress ?? [])) {
      if (!byPatient[p.patient_id]) byPatient[p.patient_id] = []
      byPatient[p.patient_id]!.push(p)
    }

    for (const [pid, rows] of Object.entries(byPatient)) {
      if (!rows) continue
      lastActivityMap[pid] = rows[0]?.date ?? ''
      const latestDate = rows[0]?.date
      const latestRows = rows.filter(r => r.date === latestDate)
      const avg = latestRows.reduce((a, r) => a + r.percentage, 0) / (latestRows.length || 1)
      progressMap[pid] = Math.round(avg)
    }
  }

  const enriched = (patients ?? []).map(p => ({
    id: p.id,
    fullName: profilesMap[p.id]?.full_name ?? 'Sin nombre',
    avatarUrl: profilesMap[p.id]?.avatar_url ?? null,
    active: p.active ?? true,
    diagnosis: p.diagnosis,
    progress: progressMap[p.id] ?? 0,
    lastActivity: lastActivityMap[p.id] ?? null,
  }))

  return <AdminDashboard patients={enriched} />
}
