'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function DownloadButton() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
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

  const handleClick = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setInstallPrompt(null)
        setInstalled(true)
      }
      return
    }
    setShowGuide(true)
  }

  if (!isMounted || installed) return null

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isSamsung = /SamsungBrowser/i.test(ua)

  const steps = isIOS
    ? [
        { n: '1', t: 'Tap the Share button ↑', d: 'The box with an arrow at the bottom of Safari' },
        { n: '2', t: 'Tap "Add to Home Screen"', d: 'Scroll the share menu to find it' },
        { n: '3', t: 'Tap "Add"', d: 'ZIM MALL icon will appear on your home screen' },
      ]
    : isSamsung
    ? [
        { n: '1', t: 'Tap the menu icon ☰ at the bottom', d: 'Opens the Samsung Internet menu' },
        { n: '2', t: 'Tap "Add page to" → "Home screen"', d: '' },
        { n: '3', t: 'Tap "Add"', d: 'ZIM MALL icon will appear on your home screen' },
      ]
    : [
        { n: '1', t: 'Tap the 3 dots ⋮ at the top right of Chrome', d: 'Opens the Chrome menu' },
        { n: '2', t: 'Tap "Add to Home screen" or "Install app"', d: '' },
        { n: '3', t: 'Tap "Add"', d: 'ZIM MALL icon will appear on your home screen' },
      ]

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-6 py-3 bg-white text-brand-700 font-bold rounded-lg shadow hover:bg-brand-50 transition-colors text-sm"
      >
        <Download className="h-5 w-5" />
        Download App — Free
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-lg">Download ZIM MALL</h3>
              <button onClick={() => setShowGuide(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Do these steps <span className="font-semibold text-gray-800">in your browser right now</span>:
            </p>
            <div className="space-y-4">
              {steps.map(({ n, t, d }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {n}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t}</p>
                    {d && <p className="text-gray-500 text-xs mt-0.5">{d}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800 font-medium">
              After step 3, ZIM MALL will be on your home screen like a real app.
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
