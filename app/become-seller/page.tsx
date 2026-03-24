import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BecomeSellerForm from './BecomeSellerForm'

export const metadata = { title: 'Open Your Store' }

export default async function BecomeSellerPage() {
  const session = await auth()

  if (!session) redirect('/login?callbackUrl=/become-seller')
  if (session.user.role === 'SELLER' || session.user.role === 'ADMIN') redirect('/dashboard')

  return (
    <BecomeSellerForm
      userEmail={session.user.email ?? ''}
      userName={session.user.name ?? ''}
    />
  )
}
