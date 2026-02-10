import { useState, useEffect } from 'react'
import { Scale, Check } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card'
import Button from '../ui/Button'

export default function WeightInput({ date }) {
  const weightLogs = useAppStore((state) => state.weightLogs)
  const addWeightLog = useAppStore((state) => state.addWeightLog)

  const [weight, setWeight] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const existingLog = weightLogs.find((l) => l.date === date)
    if (existingLog) {
      setWeight(existingLog.weight.toString())
      setSaved(true)
    } else {
      setWeight('')
      setSaved(false)
    }
  }, [date, weightLogs])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!weight) return

    await addWeightLog({
      date,
      weight: parseFloat(weight)
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const lastWeight = weightLogs[0]?.weight

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale size={20} className="text-[var(--accent)]" />
          Kilo Takibi
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={lastWeight ? `Son: ${lastWeight} kg` : 'Kilonuzu girin'}
                step="0.1"
                min="0"
                className="h-12 w-full bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg pl-4 pr-11 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm">
                kg
              </span>
            </div>

            <Button
              type="submit"
              disabled={!weight || saved}
              className="px-7 h-12 shrink-0 min-w-[7rem]"
            >
              {saved ? <Check size={18} /> : 'Kaydet'}
            </Button>
          </div>

          {saved && (
            <p className="text-sm text-[var(--success)] text-center">
              Kilo kaydedildi!
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
