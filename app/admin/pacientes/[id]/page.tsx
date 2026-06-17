import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import PatientDetailClient from './PatientDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: patient } = await supabase
    .from('patients')
    .select('id, active, diagnosis, notes, created_at')
    .eq('id', id)
    .single() as { data: AnyData }

  if (!patient) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', id)
    .single() as { data: AnyData }

  const { data: progress } = await supabase
    .from('progress_daily')
    .select('*')
    .eq('patient_id', id)
    .order('date', { ascending: true })
    .limit(30) as { data: AnyData[] | null }

  const { data: rawResponses } = await supabase
    .from('task_responses')
    .select('id, recording_url, selected_options, score, therapist_note, responded_at, patient_task_id')
    .eq('patient_id', id)
    .order('responded_at', { ascending: false }) as { data: AnyData[] | null }

  const ptIds = (rawResponses ?? []).map((r: AnyData) => r.patient_task_id)
  const ptMap: Record<string, { id: string; task_id: string }> = {}
  const tasksMap: Record<string, { title: string; type: string; area: string }> = {}

  if (ptIds.length > 0) {
    const { data: pts } = await supabase
      .from('patient_tasks')
      .select('id, task_id')
      .in('id', ptIds) as { data: AnyData[] | null }

    for (const pt of (pts ?? [])) ptMap[pt.id] = pt

    const taskIds = [...new Set((pts ?? []).map((pt: AnyData) => pt.task_id))]
    if (taskIds.length > 0) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, type, area')
        .in('id', taskIds) as { data: AnyData[] | null }

      for (const t of (tasks ?? [])) tasksMap[t.id] = t
    }
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
  )

  const responses = await Promise.all(
    (rawResponses ?? []).map(async (r: AnyData) => {
      let audioUrl: string | null = null

      if (r.recording_url) {
        const { data: signed } = await adminClient.storage
          .from('recordings')
          .createSignedUrl(r.recording_url, 3600)
        audioUrl = signed?.signedUrl ?? null
      }

      const pt = ptMap[r.patient_task_id]
      const task = pt ? tasksMap[pt.task_id] : null

      return {
        id: r.id,
        recording_url: audioUrl,
        selected_options: r.selected_options as string[] | null,
        score: r.score,
        therapist_note: r.therapist_note,
        responded_at: r.responded_at ?? new Date().toISOString(),
        patient_tasks: pt ? {
          id: pt.id,
          completed: true,
          tasks: task ?? null,
        } : null,
      }
    })
  )

  return (
    <PatientDetailClient
      patientId={id}
      fullName={profile?.full_name ?? 'Paciente'}
      avatarUrl={profile?.avatar_url ?? null}
      active={patient.active ?? true}
      diagnosis={patient.diagnosis ?? null}
      notes={patient.notes ?? null}
      createdAt={patient.created_at ?? ''}
      progress={progress ?? []}
      responses={responses}
    />
  )
}
