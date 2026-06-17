'use client'

import Link from 'next/link'
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
      <Link href="/admin" className="flex items-center gap-2 mr-auto">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C7 2 3 6 3 11c0 2.5 1 4.7 2.6 6.3L4 22l4.7-1.6c1 .4 2.1.6 3.3.6 5 0 9-4 9-9s-4-9-9-9z" fill="white"/>
          </svg>
        </div>
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
