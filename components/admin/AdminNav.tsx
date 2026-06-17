'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminNav() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-gray-100 z-50 h-16 flex items-center px-6">
      <Link href="/admin" className="flex items-center gap-2.5 mr-auto">
        <Image
          src="/icons/logo.png"
          alt="NeuroRehab"
          width={32}
          height={32}
          className="rounded-lg"
        />
        <span className="font-bold text-text">NeuroRehab</span>
        <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full font-medium ml-1">Admin</span>
      </Link>

      <nav className="flex items-center gap-1">
        <Link href="/admin" className="px-3 py-1.5 text-sm text-text-muted hover:text-text hover:bg-bg rounded-lg transition-colors">
          Pacientes
        </Link>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          Salir
        </button>
      </nav>
    </header>
  )
}
