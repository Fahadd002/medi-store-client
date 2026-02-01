'use client'

import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/login')
          },
        },
      })
    }

    handleLogout()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg font-semibold">Logging out...</p>
      </div>
    </div>
  )
}
