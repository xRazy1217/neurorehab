import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { patientId, full_name, diagnosis, notes, active } = await req.json()
    if (!patientId) return Response.json({ error: 'Falta patientId' }, { status: 400 })

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update profile name
    if (full_name) {
      await adminClient.from('profiles').update({ full_name }).eq('id', patientId)
    }

    // Update clinical data
    await adminClient.from('patients').update({
      diagnosis: diagnosis ?? null,
      notes: notes ?? null,
      active: active ?? true,
    }).eq('id', patientId)

    return Response.json({ success: true })
  } catch (e) {
    console.error('update-patient error:', e)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
