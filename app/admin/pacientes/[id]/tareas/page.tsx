import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import PatientTasksClient from './PatientTasksClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PatientTasksPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: patient } = await supabase
    .from('patients')
    .select('id, profiles!patients_id_fkey (full_name)')
    .eq('id', id)
    .single()

  if (!patient) notFound()

  const profile = patient.profiles as { full_name: string } | null

  // Assigned tasks
  const { data: assignedTasks } = await supabase
    .from('patient_tasks')
    .select(`
      id, completed, due_date, assigned_at,
      tasks (id, title, type, area, duration_minutes, description)
    `)
    .eq('patient_id', id)
    .order('assigned_at', { ascending: false })

  // Available tasks library
  const { data: taskLibrary } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <PatientTasksClient
      patientId={id}
      patientName={profile?.full_name ?? 'Paciente'}
      assignedTasks={(assignedTasks ?? []).map(t => ({ ...t, completed: t.completed ?? false, assigned_at: t.assigned_at ?? new Date().toISOString() }))}
      taskLibrary={taskLibrary ?? []}
    />
  )
}
