import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    // Verify the requester is an admin using their session
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check role via metadata (fast, no DB query)
    const role = user.user_metadata?.role
    if (role !== 'admin') {
      return Response.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const { email, password, full_name, diagnosis, notes } = body

    if (!email || !password || !full_name) {
      return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Create admin client inside handler so env vars are available
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'patient' },
    })

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 })
    }

    // Insert into profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: authUser.user.id, role: 'patient', full_name })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return Response.json({ error: profileError.message }, { status: 500 })
    }

    // Insert into patients
    const { error: patientError } = await supabaseAdmin
      .from('patients')
      .insert({
        id: authUser.user.id,
        therapist_id: user.id,
        diagnosis: diagnosis || null,
        notes: notes || null,
      })

    if (patientError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return Response.json({ error: patientError.message }, { status: 500 })
    }

    return Response.json({ success: true, userId: authUser.user.id })
  } catch (err) {
    console.error('create-patient error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
