import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card'
import Button from '../ui/Button'

const timeRanges = [
  { label: '1 Hafta', days: 7 },
  { label: '1 Ay', days: 30 },
  { label: '3 Ay', days: 90 },
  { label: 'Tümü', days: 0 }
]

export default function WeightChart() {
  const weightLogs = useAppStore((state) => state.weightLogs)
  const [selectedRange, setSelectedRange] = useState(30)

  const chartData = useMemo(() => {
    if (weightLogs.length === 0) return []

    let filteredLogs = [...weightLogs]

    if (selectedRange > 0) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - selectedRange)
      filteredLogs = filteredLogs.filter((log) => new Date(log.date) >= cutoffDate)
    }

    return filteredLogs
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((log) => ({
        date: new Date(log.date).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'short'
        }),
        weight: log.weight
      }))
  }, [weightLogs, selectedRange])

  const stats = useMemo(() => {
    if (chartData.length < 2) return null

    const firstWeight = chartData[0].weight
    const lastWeight = chartData[chartData.length - 1].weight
    const diff = lastWeight - firstWeight
    const minWeight = Math.min(...chartData.map((d) => d.weight))
    const maxWeight = Math.max(...chartData.map((d) => d.weight))

    return { diff, minWeight, maxWeight, firstWeight, lastWeight }
  }, [chartData])

  if (weightLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kilo Grafiği</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-[var(--text-secondary)]">
            Grafik için kilo kayıtları ekleyin.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kilo Grafiği</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {timeRanges.map((range) => (
            <Button
              key={range.days}
              variant={selectedRange === range.days ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedRange(range.days)}
              className="px-4 py-2.5"
            >
              {range.label}
            </Button>
          ))}
        </div>

        {stats && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {stats.diff < 0 ? (
                <TrendingDown size={16} className="text-[var(--success)]" />
              ) : stats.diff > 0 ? (
                <TrendingUp size={16} className="text-red-400" />
              ) : (
                <Minus size={16} className="text-[var(--text-secondary)]" />
              )}
              <span className={
                stats.diff < 0 ? 'text-[var(--success)]' : stats.diff > 0 ? 'text-red-400' : 'text-[var(--text-secondary)]'
              }>
                {stats.diff > 0 ? '+' : ''}{stats.diff.toFixed(1)} kg
              </span>
            </div>
            <span className="text-[var(--text-secondary)]">
              Min: {stats.minWeight} kg
            </span>
            <span className="text-[var(--text-secondary)]">
              Max: {stats.maxWeight} kg
            </span>
          </div>
        )}

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e07a5f" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#e07a5f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#a0a0a0', fontSize: 12 }}
                axisLine={{ stroke: '#2f2f2f' }}
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fill: '#a0a0a0', fontSize: 12 }}
                axisLine={{ stroke: '#2f2f2f' }}
                tickFormatter={(value) => `${value} kg`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#252525',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f5f5f5'
                }}
                formatter={(value) => [`${value} kg`, 'Kilo']}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#e07a5f"
                strokeWidth={2}
                fill="url(#weightGradient)"
                dot={{ fill: '#e07a5f', r: 4 }}
                activeDot={{ r: 6, fill: '#f4a261' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
