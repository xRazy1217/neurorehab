import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { wasCompletedToday } from '@/lib/exercises'
import ImageNamingExercise from '@/components/exercises/ImageNamingExercise'
import PhraseRepetitionExercise from '@/components/exercises/PhraseRepetitionExercise'
import VisualMemoryExercise from '@/components/exercises/VisualMemoryExercise'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ExercisePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get patient task
  const { data: pt, error: ptError } = await supabase
    .from('patient_tasks')
    .select('id, completed, completed_at, patient_id, task_id')
    .eq('id', id)
    .eq('patient_id', user.id)
    .single()

  if (ptError || !pt) {
    console.error('patient_task error:', ptError)
    notFound()
  }

  // Get the task separately
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, title, description, type, area, duration_minutes, content')
    .eq('id', pt.task_id)
    .single()

  if (taskError || !task) {
    console.error('task error:', taskError)
    notFound()
  }

  const content = task.content as Record<string, unknown>

  const commonProps = {
    patientTaskId: pt.id,
    patientId: user.id,
    title: task.title,
    area: task.area,
    alreadyCompleted: wasCompletedToday(pt.completed_at),  // daily reset
  }

  if (task.type === 'image_naming') {
    return (
      <ImageNamingExercise
        {...commonProps}
        content={content as { images: Array<{ url: string; answer: string }> }}
      />
    )
  }

  if (task.type === 'phrase_repetition') {
    return (
      <PhraseRepetitionExercise
        {...commonProps}
        content={content as { phrases: string[] }}
      />
    )
  }

  if (task.type === 'visual_memory') {
    return (
      <VisualMemoryExercise
        {...commonProps}
        content={content as {
          image_url: string
          display_seconds: number
          question: string
          options: string[]
          correct: string[]
        }}
      />
    )
  }

  notFound()
}
