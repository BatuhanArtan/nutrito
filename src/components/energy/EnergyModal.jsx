import { useState, useMemo, useEffect } from 'react'
import { Trash2, Plus, Pencil, Check, X } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import useAppStore from '../../stores/appStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

const LEVELS = [
  { value: 1, label: '😴', desc: 'Çok Düşük' },
  { value: 2, label: '😟', desc: 'Düşük' },
  { value: 3, label: '😐', desc: 'Orta' },
  { value: 4, label: '🙂', desc: 'Yüksek' },
  { value: 5, label: '⚡', desc: 'Çok Yüksek' }
]

const RANGES = [
  { label: 'Bugün', key: 'today' },
  { label: 'Hafta', key: 'week' },
  { label: 'Ay', key: 'month' },
  { label: '6 Ay', key: '6month' },
  { label: 'Tümü', key: 'all' }
]

function filterLogs(logs, rangeKey) {
  const now = new Date()
  const cutoffs = {
    today: () => { const d = new Date(now); d.setHours(0,0,0,0); return d },
    week:  () => { const d = new Date(now); d.setDate(d.getDate() - 7); return d },
    month: () => { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d },
    '6month': () => { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d },
    all: () => null
  }
  const cutoff = cutoffs[rangeKey]?.()
  if (!cutoff) return logs
  return logs.filter(l => new Date(l.timestamp) >= cutoff)
}

function formatChartTime(timestamp, rangeKey) {
  const d = new Date(timestamp)
  if (rangeKey === 'today') return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  if (rangeKey === 'week') return d.toLocaleDateString('tr-TR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

export default function EnergyModal({ isOpen, onClose }) {
  const energyLogs = useAppStore((state) => state.energyLogs)
  const addEnergyLog = useAppStore((state) => state.addEnergyLog)
  const updateEnergyLog = useAppStore((state) => state.updateEnergyLog)
  const deleteEnergyLog = useAppStore((state) => state.deleteEnergyLog)

  const [range, setRange] = useState('today')
  const [tab, setTab] = useState('add') // 'chart' | 'history' | 'add'
  const [addLevel, setAddLevel] = useState(null)
  const [addTime, setAddTime] = useState('')
  const [addDate, setAddDate] = useState('')
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editLevel, setEditLevel] = useState(null)

  const getNow = () => {
    const now = new Date()
    return {
      time: now.toTimeString().slice(0, 5),
      date: now.toISOString().slice(0, 10)
    }
  }

  // Modal her açıldığında zamanı güncelle
  useEffect(() => {
    if (isOpen) {
      const { time, date } = getNow()
      setAddTime(time)
      setAddDate(date)
      setAddLevel(null)
    }
  }, [isOpen])

  const sortedLogs = useMemo(
    () => [...energyLogs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    [energyLogs]
  )

  const filteredLogs = useMemo(() => filterLogs(sortedLogs, range), [sortedLogs, range])

  const chartData = useMemo(
    () => filteredLogs.map(l => ({
      time: formatChartTime(l.timestamp, range),
      level: l.level,
      id: l.id
    })),
    [filteredLogs, range]
  )

  const avgLevel = useMemo(() => {
    if (filteredLogs.length === 0) return null
    return (filteredLogs.reduce((s, l) => s + l.level, 0) / filteredLogs.length).toFixed(1)
  }, [filteredLogs])

  const handleAdd = async () => {
    if (!addLevel) return
    setAdding(true)
    const timestamp = new Date(`${addDate}T${addTime}:00`).toISOString()
    await addEnergyLog(timestamp, addLevel)
    setAddLevel(null)
    const { time, date } = getNow()
    setAddTime(time)
    setAddDate(date)
    setTab('chart')
    setAdding(false)
  }

  const levelColor = (level) => {
    if (level <= 1) return '#f87171'
    if (level <= 2) return '#fb923c'
    if (level <= 3) return '#facc15'
    if (level <= 4) return '#4ade80'
    return '#34d399'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enerji Takibi">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Tab seçimi */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { key: 'chart', label: 'Grafik' },
            { key: 'history', label: 'Geçmiş' },
            { key: 'add', label: '+ Ekle' }
          ].map(t => (
            <Button
              key={t.key}
              type="button"
              variant={tab === t.key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTab(t.key)}
              className="flex-1"
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* --- GRAFIK TAB --- */}
        {tab === 'chart' && (
          <>
            {/* Zaman aralığı */}
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {RANGES.map(r => (
                <Button
                  key={r.key}
                  type="button"
                  variant={range === r.key ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setRange(r.key)}
                  style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
                >
                  {r.label}
                </Button>
              ))}
            </div>

            {/* Ortalama */}
            {avgLevel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="text-sm text-[var(--text-secondary)]">Ortalama:</span>
                <span className="text-sm font-bold" style={{ color: levelColor(parseFloat(avgLevel)) }}>
                  {avgLevel} / 5
                </span>
                <span className="text-sm text-[var(--text-secondary)]">({filteredLogs.length} kayıt)</span>
              </div>
            )}

            {chartData.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] text-center" style={{ padding: '2rem 0' }}>
                Bu aralıkta kayıt yok
              </p>
            ) : (
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />
                    <XAxis dataKey="time" tick={{ fill: '#a0a0a0', fontSize: 10 }} axisLine={{ stroke: '#2f2f2f' }} interval="preserveStartEnd" />
                    <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fill: '#a0a0a0', fontSize: 11 }} axisLine={{ stroke: '#2f2f2f' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#252525', border: 'none', borderRadius: '8px', color: '#f5f5f5' }}
                      formatter={(v) => {
                        const found = LEVELS.find(l => l.value === v)
                        return [`${found?.label || ''} ${v} — ${found?.desc || ''}`, 'Enerji']
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="level"
                      stroke="#4ade80"
                      strokeWidth={2}
                      fill="url(#energyGrad)"
                      dot={{ fill: '#4ade80', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* --- GEÇMİŞ TAB --- */}
        {tab === 'history' && (
          <div style={{ maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0 0.25rem' }}>
            {sortedLogs.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] text-center" style={{ padding: '2rem 0' }}>Henüz kayıt yok</p>
            ) : (
              [...sortedLogs].reverse().map(log => {
                const lvl = LEVELS.find(l => l.value === log.level)
                const d = new Date(log.timestamp)
                const isEditing = editingId === log.id

                if (isEditing) {
                  return (
                    <div
                      key={log.id}
                      className="bg-[var(--bg-tertiary)] rounded-lg"
                      style={{ padding: '0.625rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                    >
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="date"
                          value={editDate}
                          onChange={e => setEditDate(e.target.value)}
                          className="bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] rounded-lg px-2 py-1 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] transition-colors"
                          style={{ flex: 1 }}
                        />
                        <input
                          type="time"
                          value={editTime}
                          onChange={e => setEditTime(e.target.value)}
                          className="bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] rounded-lg px-2 py-1 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] transition-colors"
                          style={{ flex: 1 }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {LEVELS.map(l => (
                          <button
                            key={l.value}
                            type="button"
                            onClick={() => setEditLevel(l.value)}
                            className="rounded-lg text-sm transition-all"
                            style={{
                              padding: '0.25rem 0.625rem',
                              background: editLevel === l.value ? 'var(--accent)' : 'var(--bg-primary)',
                              color: editLevel === l.value ? '#fff' : 'var(--text-secondary)',
                              border: editLevel === l.value ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                            }}
                          >
                            {l.label} {l.desc}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(null)}
                        >
                          <X size={14} className="text-[var(--text-secondary)]" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            if (!editDate || !editTime || !editLevel) return
                            const ts = new Date(`${editDate}T${editTime}:00`).toISOString()
                            await updateEnergyLog(log.id, { timestamp: ts, level: editLevel })
                            setEditingId(null)
                          }}
                        >
                          <Check size={14} className="text-green-400" />
                        </Button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={log.id}
                    className="flex items-center bg-[var(--bg-tertiary)] rounded-lg"
                    style={{ padding: '0.5rem 0.375rem 0.5rem 0.75rem', gap: '0.375rem' }}
                  >
                    <span className="text-xs text-[var(--text-secondary)] flex-shrink-0" style={{ width: '3.75rem' }}>
                      {d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] flex-shrink-0" style={{ width: '2.75rem' }}>
                      {d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm flex-shrink-0">{lvl?.label}</span>
                    <span className="text-sm flex-1 min-w-0 truncate" style={{ color: levelColor(log.level) }}>{lvl?.desc}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="!p-1.5 flex-shrink-0"
                      onClick={() => {
                        setEditingId(log.id)
                        setEditDate(d.toISOString().slice(0, 10))
                        setEditTime(d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'))
                        setEditLevel(log.level)
                      }}
                    >
                      <Pencil size={13} className="text-[var(--text-secondary)]" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="!p-1.5 flex-shrink-0"
                      onClick={() => deleteEnergyLog(log.id)}
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* --- EKLE TAB --- */}
        {tab === 'add' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                <label className="text-sm text-[var(--text-secondary)]">Tarih</label>
                <input
                  type="date"
                  value={addDate}
                  onChange={e => setAddDate(e.target.value)}
                  className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                <label className="text-sm text-[var(--text-secondary)]">Saat</label>
                <input
                  type="time"
                  value={addTime}
                  onChange={e => setAddTime(e.target.value)}
                  className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="text-sm text-[var(--text-secondary)]">Enerji seviyesi</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {LEVELS.map(l => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setAddLevel(l.value)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 0',
                      borderRadius: '0.5rem',
                      border: addLevel === l.value ? `2px solid ${levelColor(l.value)}` : '2px solid var(--bg-tertiary)',
                      background: addLevel === l.value ? `${levelColor(l.value)}22` : 'var(--bg-tertiary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{l.label}</span>
                    <span style={{ fontSize: '0.6rem', color: addLevel === l.value ? levelColor(l.value) : 'var(--text-secondary)' }}>{l.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="button"
              className="w-full"
              style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
              disabled={!addLevel || adding}
              onClick={handleAdd}
            >
              <Plus size={16} style={{ marginRight: '0.4rem' }} />
              {adding ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
