import { useState, useEffect } from 'react'
import { Search, BookOpen } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

export default function EditMealItemModal({ isOpen, onClose, item }) {
  const foods = useAppStore((state) => state.foods)
  const recipes = useAppStore((state) => state.recipes)
  const units = useAppStore((state) => state.units)
  const updateMealItem = useAppStore((state) => state.updateMealItem)

  const [quantity, setQuantity] = useState('1')
  const [unitId, setUnitId] = useState('')
  const [itemType, setItemType] = useState('food')
  const [selectedItem, setSelectedItem] = useState(null)
  const [changing, setChanging] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isOpen || !item) return
    setQuantity(String(item.quantity ?? 1))
    setUnitId(item.unit_id ?? '')
    setChanging(false)
    setSearchTerm('')
    if (item.food) {
      setItemType('food')
      setSelectedItem(item.food)
    } else if (item.recipe) {
      setItemType('recipe')
      setSelectedItem(item.recipe)
    }
  }, [isOpen, item])

  const filteredItems = itemType === 'food'
    ? foods.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : recipes.filter((r) => r.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSelectItem = (newItem) => {
    setSelectedItem(newItem)
    if (itemType === 'food' && newItem.default_unit_id) {
      setUnitId(newItem.default_unit_id)
    }
    setChanging(false)
    setSearchTerm('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedItem || !quantity) return

    await updateMealItem(item.id, {
      food_id: itemType === 'food' ? selectedItem.id : null,
      recipe_id: itemType === 'recipe' ? selectedItem.id : null,
      quantity: parseFloat(quantity),
      unit_id: unitId || null
    })

    onClose()
  }

  const handleClose = () => {
    setChanging(false)
    setSearchTerm('')
    onClose()
  }

  if (!item) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Besini Düzenle">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Seçili besin / tarif */}
        {!changing ? (
          <div className="bg-[var(--bg-tertiary)] rounded-lg" style={{ padding: '1.25rem' }}>
            <p className="text-[var(--text-primary)] font-medium">
              {selectedItem
                ? (itemType === 'food' ? selectedItem.name : selectedItem.title)
                : '—'}
            </p>
            <button
              type="button"
              onClick={() => setChanging(true)}
              className="text-sm text-[var(--accent)] hover:underline"
              style={{ marginTop: '0.25rem' }}
            >
              Değiştir
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Tür seçimi */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                type="button"
                variant={itemType === 'food' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => { setItemType('food'); setSelectedItem(null) }}
                className="flex-1"
              >
                Besin
              </Button>
              <Button
                type="button"
                variant={itemType === 'recipe' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => { setItemType('recipe'); setSelectedItem(null) }}
                className="flex-1"
              >
                Tarif
              </Button>
            </div>

            {/* Arama */}
            <div className="relative">
              <Search
                className="absolute text-[var(--text-secondary)]"
                size={18}
                style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder={`${itemType === 'food' ? 'Besin' : 'Tarif'} ara...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', boxSizing: 'border-box' }}
                className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Liste */}
            <div className="max-h-44 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {filteredItems.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] text-center" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
                  Sonuç bulunamadı
                </p>
              ) : (
                filteredItems.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectItem(f)}
                    className="w-full text-left rounded-lg bg-[var(--bg-tertiary)] hover:bg-[#3a3a3a] transition-colors flex items-center gap-2"
                    style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                  >
                    <span className="text-[var(--text-primary)] flex-1">
                      {itemType === 'food' ? f.name : f.title}
                    </span>
                    {itemType === 'food' && f.recipe_id && (
                      <BookOpen size={13} className="text-[var(--accent)] flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => { setChanging(false); setSearchTerm('') }}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left"
            >
              ← İptal
            </button>
          </div>
        )}

        {/* Miktar & Birim */}
        {!changing && (
          <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
            <Input
              label="Miktar"
              type="number"
              value={quantity}
              onChange={setQuantity}
              step="0.5"
              min="0"
            />
            <Select
              label="Birim"
              value={unitId}
              onChange={setUnitId}
              options={units.map((u) => ({ value: u.id, label: u.name }))}
              placeholder="Birim seçin"
            />
          </div>
        )}

        {/* Butonlar */}
        {!changing && (
          <Button
            type="submit"
            className="w-full"
            style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            disabled={!selectedItem || !quantity}
          >
            Kaydet
          </Button>
        )}
      </form>
    </Modal>
  )
}
