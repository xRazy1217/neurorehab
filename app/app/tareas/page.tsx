import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import TareasClient from './TareasClient'

export default async function TareasPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  // Get patient tasks
  const { data: patientTasks } = await supabase
    .from('patient_tasks')
    .select('id, completed, completed_at, due_date, assigned_at, task_id')
    .eq('patient_id', user.id)
    .order('assigned_at', { ascending: false })

  // Get the actual tasks
  const taskIds = (patientTasks ?? []).map(pt => pt.task_id)
  const tasksMap: Record<string, {
    id: string; title: string; description: string
    type: string; area: string; duration_minutes: number
  }> = {}

  if (taskIds.length > 0) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, description, type, area, duration_minutes')
      .in('id', taskIds)

    for (const t of (tasks ?? [])) {
      tasksMap[t.id] = t
    }
  }

  // A task is "completed TODAY" only if completed_at is today's date.
  // This implements daily reset: every new day all tasks appear pending again.
  const merged = (patientTasks ?? []).map(pt => {
    const completedToday = pt.completed_at
      ? pt.completed_at.startsWith(today)
      : false

    return {
      id: pt.id,
      completed: completedToday,          // daily reset logic
      completed_at: pt.completed_at,
      due_date: pt.due_date,
      assigned_at: pt.assigned_at ?? new Date().toISOString(),
      tasks: tasksMap[pt.task_id] ?? null,
    }
  })

  // Weekly plan: tasks completed this week (Mon–Sun)
  const weekStart = new Date()
  const day = weekStart.getDay()
  weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1)) // Monday
  weekStart.setHours(0, 0, 0, 0)

  const weekCompleted = (patientTasks ?? []).filter(pt => {
    if (!pt.completed_at) return false
    return new Date(pt.completed_at) >= weekStart
  }).length

  // weekTotal = total assigned tasks (all of them count toward the weekly plan)
  const weekTotal = merged.length

  return (
    <TareasClient
      tasks={merged}
      weekTotal={weekTotal}
      weekCompleted={weekCompleted}
    />
  )
}
