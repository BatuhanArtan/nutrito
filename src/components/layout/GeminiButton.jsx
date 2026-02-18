import { Sparkles } from 'lucide-react'

const WEB_URL = 'https://gemini.google.com/gem/a445a7ad3082/39929244a9227eab'
const APP_INTENT = 'intent://#Intent;package=com.google.android.apps.bard;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end'

export default function GeminiButton() {
  const handleClick = () => {
    const isAndroid = /Android/i.test(navigator.userAgent)
    if (isAndroid) {
      window.location.href = APP_INTENT
      setTimeout(() => {
        window.open(WEB_URL, '_blank', 'noopener,noreferrer')
      }, 2000)
    } else {
      window.open(WEB_URL, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50
                 bg-gradient-to-r from-purple-500 to-pink-500
                 hover:from-purple-600 hover:to-pink-600
                 text-white p-4 rounded-full shadow-lg
                 transition-all duration-300 hover:scale-110
                 flex items-center justify-center border-0 cursor-pointer"
      title="Gemini ile Konuş"
    >
      <Sparkles size={24} />
    </button>
  )
}
