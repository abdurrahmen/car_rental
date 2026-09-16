import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const { lang } = await params

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}/${lang}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/${lang}/login?error=auth-callback-failed`)
}
