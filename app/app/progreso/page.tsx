import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProgresoClient, { type DailyProgress } from './ProgresoClient'

export default async function ProgresoPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Last 30 days of progress
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: progress } = await supabase
    .from('progress_daily')
    .select('*')
    .eq('patient_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  const { count: completedCount } = await supabase
    .from('patient_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', user.id)
    .eq('completed', true)

  const { data: allProgress } = await supabase
    .from('progress_daily')
    .select('date, time_spent_minutes')
    .eq('patient_id', user.id)

  const totalMinutes = (allProgress ?? []).reduce((a, p) => a + (p.time_spent_minutes ?? 0), 0)

  // Streak
  const streak = calculateStreak(allProgress ?? [])

  // Average score
  const { data: responses } = await supabase
    .from('task_responses')
    .select('score')
    .eq('patient_id', user.id)
    .not('score', 'is', null)

  const avgScore = responses?.length
    ? Math.round(responses.reduce((a, r) => a + (r.score ?? 0), 0) / responses.length)
    : 0

  return (
    <ProgresoClient
      progress={(progress ?? []) as DailyProgress[]}
      completedCount={completedCount ?? 0}
      totalMinutes={totalMinutes}
      streak={streak}
      avgScore={avgScore}
    />
  )
}

function calculateStreak(progress: Array<{ date: string }>) {
  const dates = [...new Set(progress.map(p => p.date))].sort().reverse()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  let current = new Date(today)
  for (const dateStr of dates) {
    const d = new Date(dateStr); d.setHours(0,0,0,0)
    const diff = Math.round((current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0 || diff === 1) { streak++; current = d } else break
  }
  return streak
}
