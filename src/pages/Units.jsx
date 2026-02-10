import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import useAppStore from '../stores/appStore'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Units() {
  const units = useAppStore((state) => state.units)
  const addUnit = useAppStore((state) => state.addUnit)
  const updateUnit = useAppStore((state) => state.updateUnit)
  const deleteUnit = useAppStore((state) => state.deleteUnit)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [abbreviation, setAbbreviation] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingId) {
      await updateUnit(editingId, { name: name.trim(), abbreviation: abbreviation.trim() })
      setEditingId(null)
    } else {
      await addUnit({ name: name.trim(), abbreviation: abbreviation.trim() })
    }

    setName('')
    setAbbreviation('')
    setShowForm(false)
  }

  const handleEdit = (unit) => {
    setEditingId(unit.id)
    setName(unit.name)
    setAbbreviation(unit.abbreviation || '')
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Bu birimi silmek istediğinize emin misiniz?')) {
      await deleteUnit(id)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setName('')
    setAbbreviation('')
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Birimler</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Birim Ekle
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Birimi Düzenle' : 'Yeni Birim'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Birim Adı"
                value={name}
                onChange={setName}
                placeholder="örn: Bardak"
                autoFocus
              />
              <Input
                label="Kısaltma"
                value={abbreviation}
                onChange={setAbbreviation}
                placeholder="örn: brd"
              />
              <div className="flex gap-2">
                <Button type="submit">
                  <Check size={18} />
                  {editingId ? 'Güncelle' : 'Ekle'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  <X size={18} />
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          {units.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-center py-8">
              Henüz birim eklenmemiş. Başlamak için "Birim Ekle" butonuna tıklayın.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--bg-tertiary)]">
              {units.map((unit) => (
                <li
                  key={unit.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <span className="text-[var(--text-primary)] font-medium">
                      {unit.name}
                    </span>
                    {unit.abbreviation && (
                      <span className="text-[var(--text-secondary)] ml-2">
                        ({unit.abbreviation})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(unit)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(unit.id)}
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Önerilen Birimler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            Diyetisyen listenizde sık kullanılan birimler:
          </p>
          <div className="flex flex-wrap gap-2">
            {['Bardak', 'Yemek Kaşığı (yk)', 'Tatlı Kaşığı (tk)', 'Çay Kaşığı (çk)', 'Kase', 'Adet', 'Avuç', 'Gram', 'Dilim', 'Porsiyon'].map((u) => (
              <span
                key={u}
                className="px-3 py-1 bg-[var(--bg-tertiary)] rounded-full text-sm text-[var(--text-secondary)]"
              >
                {u}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
