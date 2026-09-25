import { LoginForm } from './LoginForm'

export default async function LoginPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { lang } = await params
  const { redirect } = await searchParams
  return <LoginForm lang={lang} redirectTo={typeof redirect === 'string' ? redirect : undefined} />
}
