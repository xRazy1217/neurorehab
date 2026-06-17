import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import PatientDashboard from '@/components/patient/PatientDashboard'

export default async function PatientHomePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]

  // Today's progress per area
  const { data: todayProgress } = await supabase
    .from('progress_daily')
    .select('area, percentage, tasks_completed, time_spent_minutes')
    .eq('patient_id', user.id)
    .eq('date', today)

  // All-time progress for streak + total time
  const { data: allProgress } = await supabase
    .from('progress_daily')
    .select('date, time_spent_minutes')
    .eq('patient_id', user.id)
    .order('date', { ascending: false })

  // Tasks completed TODAY (daily reset logic)
  const { data: completedToday } = await supabase
    .from('patient_tasks')
    .select('id, completed_at')
    .eq('patient_id', user.id)
    .eq('completed', true)
    .gte('completed_at', today + 'T00:00:00')

  // Total ever completed (for all-time stats)
  const { count: totalCompleted } = await supabase
    .from('patient_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', user.id)
    .eq('completed', true)

  const streak = calculateStreak(allProgress ?? [])
  const totalMinutes = (allProgress ?? []).reduce((acc, p) => acc + (p.time_spent_minutes ?? 0), 0)

  const areas = {
    lenguaje: todayProgress?.find(p => p.area === 'lenguaje')?.percentage ?? 0,
    habla: todayProgress?.find(p => p.area === 'habla')?.percentage ?? 0,
    cognicion: todayProgress?.find(p => p.area === 'cognicion')?.percentage ?? 0,
  }

  const overallPercent = areas.lenguaje === 0 && areas.habla === 0 && areas.cognicion === 0
    ? 0
    : Math.round((areas.lenguaje + areas.habla + areas.cognicion) / 3)

  return (
    <PatientDashboard
      fullName={profile?.full_name ?? 'Paciente'}
      overallPercent={overallPercent}
      areas={areas}
      streak={streak}
      completedTodayCount={completedToday?.length ?? 0}
      totalCompletedCount={totalCompleted ?? 0}
      totalMinutes={totalMinutes}
    />
  )
}

function calculateStreak(progress: Array<{ date: string }>) {
  if (!progress.length) return 0
  const dates = [...new Set(progress.map(p => p.date))].sort().reverse()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  let current = new Date(today)
  for (const dateStr of dates) {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    const diff = Math.round((current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0 || diff === 1) { streak++; current = d } else break
  }
  return streak
}
