import { createClient } from '@/lib/supabase/client'

type SupabaseClient = ReturnType<typeof createClient>

/**
 * Returns true if a task was completed today (daily reset logic).
 */
export function wasCompletedToday(completedAt: string | null): boolean {
  if (!completedAt) return false
  const today = new Date().toISOString().split('T')[0]
  return completedAt.startsWith(today)
}

/**
 * Upload audio recording to Supabase Storage.
 * Returns the storage path.
 */
export async function uploadRecording(
  supabase: SupabaseClient,
  blob: Blob,
  patientId: string,
  patientTaskId: string,
  index: number
): Promise<string | null> {
  const ext = blob.type.includes('webm') ? 'webm' : 'm4a'
  const fileName = `${patientId}/${patientTaskId}_${index}_${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('recordings')
    .upload(fileName, blob, { contentType: blob.type, upsert: true })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  return data?.path ?? null
}

/**
 * Mark a patient_task as completed and update progress_daily.
 * Safe to call multiple times — upserts progress by date+area.
 */
export async function completePatientTask(
  supabase: SupabaseClient,
  patientTaskId: string,
  patientId: string,
  area: 'lenguaje' | 'habla' | 'cognicion',
  timeMinutes = 5
) {
  const now = new Date().toISOString()
  const today = now.split('T')[0]

  // Update patient_task with current timestamp (enables daily reset)
  await supabase
    .from('patient_tasks')
    .update({ completed: true, completed_at: now })
    .eq('id', patientTaskId)

  // Upsert today's progress for this area
  const { data: existing } = await supabase
    .from('progress_daily')
    .select('id, tasks_completed, percentage, time_spent_minutes')
    .eq('patient_id', patientId)
    .eq('date', today)
    .eq('area', area)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('progress_daily')
      .update({
        tasks_completed: existing.tasks_completed + 1,
        percentage: Math.min(100, existing.percentage + 15),
        time_spent_minutes: existing.time_spent_minutes + timeMinutes,
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('progress_daily').insert({
      patient_id: patientId,
      date: today,
      area,
      percentage: 15,
      tasks_completed: 1,
      time_spent_minutes: timeMinutes,
    })
  }
}
