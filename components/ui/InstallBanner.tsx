'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('install-dismissed')) {
      setDismissed(true)
      return
    }

    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
      setInstalled(true)
    }
  }

  const handleDismiss = () => {
    sessionStorage.setItem('install-dismissed', '1')
    setDismissed(true)
  }

  if (dismissed || installed || !installPrompt) return null

  return (
    <div className="bg-brand-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight">Get the ZIM MALL App</p>
            <p className="text-brand-100 text-xs leading-tight hidden sm:block">
              Install on your phone — shop faster, no browser needed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-4 py-2 bg-white text-brand-600 font-bold text-sm rounded-lg hover:bg-brand-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download Free
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
