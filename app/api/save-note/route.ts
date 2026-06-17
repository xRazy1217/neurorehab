import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    // Verify admin session
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { responseId, note } = await req.json()
    if (!responseId || !note?.trim()) {
      return Response.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Use service role to bypass RLS for therapist note update
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminClient
      .from('task_responses')
      .update({ therapist_note: note.trim() })
      .eq('id', responseId)

    if (error) {
      console.error('save-note error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error('save-note exception:', e)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
