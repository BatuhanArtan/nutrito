import { Sparkles } from 'lucide-react'

const WEB_URL = 'https://gemini.google.com/gem/a445a7ad3082/39929244a9227eab'
const ANDROID_INTENT = `intent://gemini.google.com/gem/a445a7ad3082/39929244a9227eab#Intent;scheme=https;package=com.google.android.apps.bard;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(WEB_URL)};end`

export default function GeminiButton() {
  const handleClick = (e) => {
    const isAndroid = /Android/i.test(navigator.userAgent)
    if (isAndroid) {
      e.preventDefault()
      window.location.href = ANDROID_INTENT
    }
  }

  return (
    <a
      href={WEB_URL}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50
                 bg-gradient-to-r from-purple-500 to-pink-500
                 hover:from-purple-600 hover:to-pink-600
                 text-white p-4 rounded-full shadow-lg
                 transition-all duration-300 hover:scale-110
                 flex items-center justify-center"
      title="Gemini ile Konuş"
    >
      <Sparkles size={24} />
    </a>
  )
}
