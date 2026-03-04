import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { TrendingDown, TrendingUp, Minus, History, Edit2, Trash2, Check, X } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

const timeRanges = [
  { label: '1 Hafta', days: 7 },
  { label: '1 Ay', days: 30 },
  { label: '3 Ay', days: 90 },
  { label: 'Tümü', days: 0 }
]

export default function WeightChart() {
  const weightLogs = useAppStore((state) => state.weightLogs)
  const weightTarget = useAppStore((state) => state.weightTarget)
  const addWeightLog = useAppStore((state) => state.addWeightLog)
  const deleteWeightLog = useAppStore((state) => state.deleteWeightLog)

  const [selectedRange, setSelectedRange] = useState(30)
  const [showHistory, setShowHistory] = useState(false)
  const [editingLog, setEditingLog] = useState(null)
  const [editWeight, setEditWeight] = useState('')

  const sortedAllLogs = useMemo(
    () => [...weightLogs].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [weightLogs]
  )

  const chartData = useMemo(() => {
    if (weightLogs.length === 0) return []

    let filtered = [...weightLogs]
    if (selectedRange > 0) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - selectedRange)
      filtered = filtered.filter((log) => new Date(log.date) >= cutoff)
    }

    return filtered
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((log) => ({
        date: new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        weight: log.weight
      }))
  }, [weightLogs, selectedRange])

  const stats = useMemo(() => {
    if (chartData.length < 2) return null
    const first = chartData[0].weight
    const last = chartData[chartData.length - 1].weight
    const diff = last - first
    return {
      diff,
      minWeight: Math.min(...chartData.map((d) => d.weight)),
      maxWeight: Math.max(...chartData.map((d) => d.weight)),
      firstWeight: first,
      lastWeight: last
    }
  }, [chartData])

  const latestWeight = sortedAllLogs[0]?.weight ?? null
  const firstWeight = sortedAllLogs.length > 0
    ? [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date))[0].weight
    : null

  const targetProgress = useMemo(() => {
    if (!weightTarget || latestWeight === null || weightLogs.length === 0) return null
    const remaining = latestWeight - weightTarget
    const achieved = Math.abs(remaining) < 0.2
    const losing = latestWeight > weightTarget

    const allWeights = weightLogs.map((l) => l.weight)
    // Kaybediyorsa: en yüksek noktadan hedefe ilerleme; alıyorsa: en düşük noktadan hedefe
    const startWeight = losing ? Math.max(...allWeights) : Math.min(...allWeights)
    const totalChange = Math.abs(weightTarget - startWeight)
    if (totalChange < 0.01) return null

    const done = Math.abs(startWeight - latestWeight)
    const percent = Math.min(100, Math.max(0, (done / totalChange) * 100))

    return { percent, remaining, achieved, losing }
  }, [weightTarget, latestWeight, weightLogs])

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto']
    const vals = chartData.map((d) => d.weight)
    if (weightTarget) vals.push(weightTarget)
    return [Math.floor(Math.min(...vals)) - 1, Math.ceil(Math.max(...vals)) + 1]
  }, [chartData, weightTarget])

  const startEdit = (log) => {
    setEditingLog(log)
    setEditWeight(log.weight.toString())
  }

  const saveEdit = async () => {
    if (!editingLog || !editWeight) return
    await addWeightLog({ date: editingLog.date, weight: parseFloat(editWeight) })
    setEditingLog(null)
    setEditWeight('')
  }

  const cancelEdit = () => {
    setEditingLog(null)
    setEditWeight('')
  }

  const handleDelete = async (log) => {
    if (confirm(`${log.date} — ${log.weight} kg silinsin mi?`)) {
      await deleteWeightLog(log.id)
    }
  }

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  if (weightLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kilo Grafiği</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-[var(--text-secondary)]">Grafik için kilo kayıtları ekleyin.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Kilo Grafiği</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(true)}
            style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
          >
            <History size={16} />
            Geçmiş
          </Button>
        </CardHeader>

        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Zaman aralığı butonları */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {timeRanges.map((range) => (
              <Button
                key={range.days}
                variant={selectedRange === range.days ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedRange(range.days)}
                style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
              >
                {range.label}
              </Button>
            ))}
          </div>

          {/* İstatistikler */}
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
                <span className={stats.diff < 0 ? 'text-[var(--success)]' : stats.diff > 0 ? 'text-red-400' : 'text-[var(--text-secondary)]'}>
                  {stats.diff > 0 ? '+' : ''}{stats.diff.toFixed(1)} kg
                </span>
              </div>
              <span className="text-[var(--text-secondary)]">Min: {stats.minWeight} kg</span>
              <span className="text-[var(--text-secondary)]">Max: {stats.maxWeight} kg</span>
            </div>
          )}

          {/* Hedef kilo ilerleme */}
          {weightTarget && targetProgress && (
            <div
              className="rounded-xl"
              style={{ background: 'var(--bg-tertiary)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.75rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span className="text-xs text-[var(--text-secondary)]">Şu an</span>
                  <span className="text-lg font-bold text-[var(--text-primary)]">{latestWeight} kg</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', alignItems: 'flex-end' }}>
                  <span className="text-xs text-[var(--text-secondary)]">Hedef</span>
                  <span className="text-lg font-bold text-green-400">{weightTarget} kg</span>
                </div>
              </div>

              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${targetProgress.percent}%`,
                    background: targetProgress.achieved
                      ? '#22c55e'
                      : 'linear-gradient(to right, #bbf7d0, #22c55e)',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>

              <div className="text-center">
                {targetProgress.achieved ? (
                  <span className="text-sm font-semibold text-[var(--success)]">🎉 Hedefe ulaştın!</span>
                ) : (
                  <span className="text-sm text-[var(--text-secondary)]">
                    {targetProgress.losing
                      ? `${Math.abs(targetProgress.remaining).toFixed(1)} kg daha ver`
                      : `${Math.abs(targetProgress.remaining).toFixed(1)} kg daha al`
                    }
                    <span className="text-[var(--text-secondary)] opacity-50" style={{ marginLeft: '0.5rem' }}>
                      ({targetProgress.percent.toFixed(0)}%)
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}

          {weightTarget && !targetProgress && latestWeight && (
            <div className="text-sm text-[var(--text-secondary)] text-center py-1">
              Hedef: <span className="text-[var(--accent)] font-medium">{weightTarget} kg</span>
            </div>
          )}

          {/* Grafik */}
          <div className="h-64" style={{ marginTop: '1rem' }}>
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
                  domain={yDomain}
                  tick={{ fill: '#a0a0a0', fontSize: 12 }}
                  axisLine={{ stroke: '#2f2f2f' }}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#252525', border: 'none', borderRadius: '8px', color: '#f5f5f5' }}
                  formatter={(value) => [`${value} kg`, 'Kilo']}
                />
                {weightTarget && (
                  <ReferenceLine
                    y={weightTarget}
                    stroke="#4ade80"
                    strokeDasharray="6 3"
                    strokeOpacity={0.8}
                    label={{ value: `Hedef ${weightTarget} kg`, fill: '#4ade80', fontSize: 11, position: 'insideTopRight' }}
                  />
                )}
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

      {/* Geçmiş modal */}
      <Modal isOpen={showHistory} onClose={() => { setShowHistory(false); cancelEdit() }} title="Kilo Geçmişi">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sortedAllLogs.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-center py-6">Henüz kilo kaydı yok.</p>
          ) : (() => {
            const oldest = sortedAllLogs[sortedAllLogs.length - 1]
            const newest = sortedAllLogs[0]
            const totalDiff = sortedAllLogs.length >= 2
              ? parseFloat((newest.weight - oldest.weight).toFixed(1))
              : null
            const totalColor = totalDiff === null ? 'var(--text-secondary)'
              : totalDiff < 0 ? '#4ade80'
              : totalDiff > 0 ? '#f87171'
              : 'var(--text-secondary)'

            return (
              <>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: '0 0.25rem', margin: 0, maxHeight: '55vh', overflowY: 'auto' }}>
                  {sortedAllLogs.map((log, index) => {
                    const prevLog = sortedAllLogs[index + 1]
                    const diff = prevLog ? parseFloat((log.weight - prevLog.weight).toFixed(1)) : null
                    let weightColor = 'var(--text-primary)'
                    let diffColor = 'var(--text-secondary)'
                    if (diff !== null) {
                      if (diff < 0) { weightColor = '#4ade80'; diffColor = '#4ade80' }
                      else if (diff > 0) { weightColor = '#f87171'; diffColor = '#f87171' }
                    }
                    return (
                      <li
                        key={log.id}
                        className="flex items-center bg-[var(--bg-tertiary)] rounded-lg"
                        style={{ padding: '0.625rem 0.625rem 0.625rem 0.875rem', gap: '0.5rem', minWidth: 0 }}
                      >
                        <span className="text-xs text-[var(--text-secondary)] flex-shrink-0" style={{ width: '5.5rem' }}>
                          {formatDate(log.date)}
                        </span>

                        {editingLog?.id === log.id ? (
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <input
                              type="number"
                              value={editWeight}
                              onChange={(e) => setEditWeight(e.target.value)}
                              step="0.1"
                              min="0"
                              autoFocus
                              className="bg-[var(--bg-secondary)] border border-[var(--accent)] rounded-lg px-2 py-1 text-[var(--text-primary)] text-sm w-16 flex-shrink-0"
                            />
                            <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">kg</span>
                            <Button variant="ghost" size="icon" onClick={saveEdit}>
                              <Check size={14} className="text-[var(--success)]" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={cancelEdit}>
                              <X size={14} className="text-[var(--text-secondary)]" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-semibold flex-shrink-0" style={{ color: weightColor, width: '4rem' }}>
                              {log.weight} kg
                            </span>
                            <span className="text-xs flex-1" style={{ color: diff !== null ? diffColor : 'transparent' }}>
                              {diff !== null ? `${diff > 0 ? '+' : ''}${diff} kg` : ''}
                            </span>
                            <div className="flex gap-0 flex-shrink-0">
                              <Button variant="ghost" size="icon" onClick={() => startEdit(log)}>
                                <Edit2 size={14} className="text-[var(--text-secondary)]" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(log)}>
                                <Trash2 size={14} className="text-red-400" />
                              </Button>
                            </div>
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>

                {totalDiff !== null && (
                  <div style={{
                    marginTop: '0.25rem',
                    padding: '0.75rem 0.875rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span className="text-xs text-[var(--text-secondary)]" style={{ lineHeight: 1.4 }}>
                      Toplam ({formatDate(oldest.date)} → {formatDate(newest.date)})
                    </span>
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: totalColor }}>
                      {totalDiff > 0 ? '+' : ''}{totalDiff} kg
                    </span>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </Modal>
    </>
  )
}
