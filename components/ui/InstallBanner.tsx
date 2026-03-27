'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [showAndroidGuide, setShowAndroidGuide] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (sessionStorage.getItem('install-dismissed')) {
      setDismissed(true)
      return
    }

    // Detect if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // Detect iPhone/iPad
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    // Detect Android
    const android = /android/i.test(navigator.userAgent)
    setIsAndroid(android)

    // Listen for Android Chrome install prompt
    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleAndroidInstall = async () => {
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
    setShowIOSGuide(false)
  }

  // Don't render until mounted (avoids hydration mismatch)
  if (!isMounted || dismissed || installed) return null

  // iPhone/iPad — show manual instructions
  if (isIOS) {
    return (
      <>
        <div className="bg-brand-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight">Get the ZIM MALL App</p>
                <p className="text-brand-100 text-xs leading-tight">
                  Install on your iPhone — no App Store needed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-brand-600 font-bold text-sm rounded-lg"
              >
                <Download className="h-4 w-4" />
                How to Install
              </button>
              <button onClick={handleDismiss} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* iPhone step-by-step guide */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Install ZIM MALL</h3>
                <button onClick={() => setShowIOSGuide(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Tap the Share button</p>
                    <p className="text-gray-500 text-xs mt-0.5">The box with an arrow at the bottom of your Safari browser</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Scroll down and tap <span className="font-bold">"Add to Home Screen"</span></p>
                    <p className="text-gray-500 text-xs mt-0.5">You may need to scroll the share menu to find it</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Tap <span className="font-bold">"Add"</span></p>
                    <p className="text-gray-500 text-xs mt-0.5">ZIM MALL will appear on your home screen like an app</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-3 bg-brand-500 text-white font-semibold rounded-xl"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // Android Chrome — direct install prompt
  if (installPrompt) {
    return (
      <div className="bg-brand-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight">Get the ZIM MALL App</p>
              <p className="text-brand-100 text-xs leading-tight">
                Install on your phone — shop faster, no browser needed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleAndroidInstall}
              className="flex items-center gap-2 px-4 py-2 bg-white text-brand-600 font-bold text-sm rounded-lg hover:bg-brand-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Free
            </button>
            <button onClick={handleDismiss} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Fallback — Android (non-Chrome) or desktop: show How to Install guide
  return (
    <>
      <div className="bg-brand-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight">Get the ZIM MALL App</p>
              <p className="text-brand-100 text-xs leading-tight">
                Install on your phone — no App Store needed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowAndroidGuide(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-brand-600 font-bold text-sm rounded-lg"
            >
              <Download className="h-4 w-4" />
              How to Install
            </button>
            <button onClick={handleDismiss} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Install ZIM MALL</h3>
              <button onClick={() => setShowAndroidGuide(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Open this link in Chrome</p>
                  <p className="text-gray-500 text-xs mt-0.5">If you are not already in Chrome, copy the link and open it there</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Tap the 3 dots menu <span className="font-bold">⋮</span> at the top right</p>
                  <p className="text-gray-500 text-xs mt-0.5">This opens the Chrome browser menu</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Tap <span className="font-bold">"Add to Home screen"</span></p>
                  <p className="text-gray-500 text-xs mt-0.5">ZIM MALL will appear on your home screen like an app</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="mt-6 w-full py-3 bg-brand-500 text-white font-semibold rounded-xl"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
