import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, clientId } = await req.json()

  if (!email || !clientId) {
    return NextResponse.json({ error: 'Missing email or clientId' }, { status: 400 })
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

  // Find auth user by email
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })

  const user = users.find(u => u.email === email)
  if (!user) {
    return NextResponse.json({
      error: `No auth user found for ${email}. Create them in Supabase → Authentication → Users first.`
    }, { status: 404 })
  }

  // Upsert profile as owner linked to this client
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: user.id, role: 'owner', client_id: clientId }, { onConflict: 'id' })

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ success: true, userId: user.id })
}
