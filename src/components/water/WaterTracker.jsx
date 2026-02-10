import { useEffect, useState } from 'react'
import { Droplets, Plus, Minus } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card'
import Button from '../ui/Button'

export default function WaterTracker({ date }) {
  const waterLogs = useAppStore((state) => state.waterLogs)
  const getOrCreateWaterLog = useAppStore((state) => state.getOrCreateWaterLog)
  const updateWaterLog = useAppStore((state) => state.updateWaterLog)

  const [waterLog, setWaterLog] = useState(null)

  useEffect(() => {
    const loadWaterLog = async () => {
      const log = await getOrCreateWaterLog(date)
      setWaterLog(log)
    }
    loadWaterLog()
  }, [date, getOrCreateWaterLog])

  useEffect(() => {
    const log = waterLogs.find((l) => l.date === date)
    if (log) setWaterLog(log)
  }, [waterLogs, date])

  const glasses = waterLog?.glasses || 0
  const target = waterLog?.target || 8

  const handleIncrement = async () => {
    const newGlasses = glasses + 1
    setWaterLog((prev) => ({ ...prev, glasses: newGlasses }))
    await updateWaterLog(date, { glasses: newGlasses })
  }

  const handleDecrement = async () => {
    if (glasses <= 0) return
    const newGlasses = glasses - 1
    setWaterLog((prev) => ({ ...prev, glasses: newGlasses }))
    await updateWaterLog(date, { glasses: newGlasses })
  }

  const percentage = Math.min((glasses / target) * 100, 100)
  const isComplete = glasses >= target

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets size={20} className="text-blue-400" />
          Su Takibi
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleDecrement}
            disabled={glasses <= 0}
          >
            <Minus size={18} />
          </Button>

          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-[var(--bg-tertiary)]"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.51} 251`}
                className={isComplete ? 'text-[var(--success)]' : 'text-blue-400'}
                style={{ transition: 'stroke-dasharray 0.3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[var(--text-primary)]">{glasses}</span>
              <span className="text-xs text-[var(--text-secondary)]">/ {target}</span>
            </div>
          </div>

          <Button
            variant={isComplete ? 'success' : 'secondary'}
            size="icon"
            onClick={handleIncrement}
          >
            <Plus size={18} />
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-1 mt-4">
          {Array.from({ length: target }).map((_, index) => (
            <Droplets
              key={index}
              size={16}
              className={index < glasses ? 'text-blue-400' : 'text-[var(--bg-tertiary)]'}
            />
          ))}
        </div>

        {isComplete && (
          <p className="text-center text-sm text-[var(--success)] mt-3">
            Günlük hedefinize ulaştınız!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
