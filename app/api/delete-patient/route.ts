import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { patientId } = await req.json()
    if (!patientId) return Response.json({ error: 'Falta patientId' }, { status: 400 })

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    )

    // Delete auth user — cascades to profiles, patients, tasks, responses
    const { error } = await adminClient.auth.admin.deleteUser(patientId)
    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ success: true })
  } catch (e) {
    console.error('delete-patient error:', e)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
