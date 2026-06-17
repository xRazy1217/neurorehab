'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-surface rounded-card shadow-xl p-4 flex items-center gap-3 z-40 animate-in border border-primary/20">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-text">Instalar NeuroRehab</p>
        <p className="text-xs text-text-muted">Accede más rápido desde tu pantalla de inicio</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShow(false)}
          className="text-xs text-text-muted px-2 py-1 rounded-lg hover:bg-bg"
        >
          Ahora no
        </button>
        <button
          onClick={handleInstall}
          className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-dark transition-all"
        >
          Instalar
        </button>
      </div>
    </div>
  )
}
