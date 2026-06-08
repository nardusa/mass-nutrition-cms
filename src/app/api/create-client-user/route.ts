import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, password, clientId } = await req.json()

  if (!email || !password || !clientId) {
    return NextResponse.json({ error: 'Missing email, password, or clientId' }, { status: 400 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create the auth user
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    // If user already exists, look them up instead
    if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
      const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const existing = users.find(u => u.email === email)
      if (existing) {
        await admin.from('profiles').upsert({ id: existing.id, role: 'owner', client_id: clientId }, { onConflict: 'id' })
        return NextResponse.json({ success: true, userId: existing.id, note: 'User already existed — profile updated' })
      }
    }
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  // Link them to the client as owner with must_change_password flag
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: created.user.id, role: 'owner', client_id: clientId, must_change_password: true }, { onConflict: 'id' })

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ success: true, userId: created.user.id })
}
