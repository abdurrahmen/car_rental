import { SignupForm } from './SignupForm'

export default async function SignupPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <SignupForm lang={lang} />
}
