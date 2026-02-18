import { useState } from 'react'
import { Search, BookOpen } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

export default function AddFoodModal({ isOpen, onClose, date, mealType }) {
  const foods = useAppStore((state) => state.foods)
  const recipes = useAppStore((state) => state.recipes)
  const units = useAppStore((state) => state.units)
  const getOrCreateDailyMeal = useAppStore((state) => state.getOrCreateDailyMeal)
  const addMealItem = useAppStore((state) => state.addMealItem)
  const addFood = useAppStore((state) => state.addFood)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [itemType, setItemType] = useState('food')
  const [quantity, setQuantity] = useState('1')
  const [unitId, setUnitId] = useState('')
  const [showNewFoodForm, setShowNewFoodForm] = useState(false)
  const [newFoodName, setNewFoodName] = useState('')
  const [newFoodDefaultUnit, setNewFoodDefaultUnit] = useState('')

  const filteredItems = itemType === 'food'
    ? foods.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : recipes.filter((r) => r.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSelectItem = (item) => {
    setSelectedItem(item)
    if (itemType === 'food' && item.default_unit_id) {
      setUnitId(item.default_unit_id)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedItem || !quantity) return

    const meal = await getOrCreateDailyMeal(date, mealType)

    await addMealItem({
      daily_meal_id: meal.id,
      food_id: itemType === 'food' ? selectedItem.id : null,
      recipe_id: itemType === 'recipe' ? selectedItem.id : null,
      quantity: parseFloat(quantity),
      unit_id: unitId || null
    })

    handleClose()
  }

  const handleClose = () => {
    setSearchTerm('')
    setSelectedItem(null)
    setItemType('food')
    setQuantity('1')
    setUnitId('')
    setShowNewFoodForm(false)
    setNewFoodName('')
    setNewFoodDefaultUnit('')
    onClose()
  }

  const handleAddNewFood = async (e) => {
    e.preventDefault()
    if (!newFoodName.trim()) return
    const newFood = await addFood({
      name: newFoodName.trim(),
      default_unit_id: newFoodDefaultUnit || null
    })
    setNewFoodName('')
    setNewFoodDefaultUnit('')
    setShowNewFoodForm(false)
    setSelectedItem(newFood)
    if (newFood.default_unit_id) setUnitId(newFood.default_unit_id)
    else setUnitId('')
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Besin Ekle">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Type Toggle */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button
            variant={itemType === 'food' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setItemType('food')
              setSelectedItem(null)
            }}
            className="flex-1"
            style={{ minHeight: '3rem', paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
          >
            Besin
          </Button>
          <Button
            variant={itemType === 'recipe' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setItemType('recipe')
              setSelectedItem(null)
            }}
            className="flex-1"
            style={{ minHeight: '3rem', paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
          >
            Tarif
          </Button>
        </div>

        {/* Besin sekmesinde: Yeni besin ekle linki */}
        {itemType === 'food' && !selectedItem && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowNewFoodForm(!showNewFoodForm)}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              {showNewFoodForm ? 'İptal' : '+ Yeni besin ekle'}
            </button>
          </div>
        )}

        {/* Yeni besin formu (Besin sekmesi) */}
        {itemType === 'food' && showNewFoodForm && (
          <form onSubmit={handleAddNewFood} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Besin adı"
              value={newFoodName}
              onChange={setNewFoodName}
              placeholder="örn: Yoğurt"
              autoFocus
            />
            <Select
              label="Varsayılan birim (opsiyonel)"
              value={newFoodDefaultUnit}
              onChange={setNewFoodDefaultUnit}
              options={units.map((u) => ({ value: u.id, label: u.name }))}
              placeholder="Birim seçin"
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                type="submit"
                disabled={!newFoodName.trim()}
                style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
              >
                Ekle ve seç
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setShowNewFoodForm(false); setNewFoodName(''); setNewFoodDefaultUnit('') }}
                style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
              >
                İptal
              </Button>
            </div>
          </form>
        )}

        {/* Search */}
        {!showNewFoodForm && (
        <div className="relative">
          <Search
            className="absolute text-[var(--text-secondary)] flex-shrink-0"
            size={20}
            strokeWidth={2}
            style={{ left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder={`${itemType === 'food' ? 'Besin' : 'Tarif'} ara...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              minHeight: '3.25rem',
              paddingLeft: '3.25rem',
              paddingRight: '1.25rem',
              paddingTop: '0.875rem',
              paddingBottom: '0.875rem',
              boxSizing: 'border-box'
            }}
            className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors leading-normal"
          />
        </div>
        )}

        {/* Item List */}
        {!selectedItem && !showNewFoodForm && (
          <div className="max-h-48 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredItems.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] text-center" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
                {searchTerm
                  ? 'Sonuç bulunamadı'
                  : `Henüz ${itemType === 'food' ? 'besin' : 'tarif'} eklenmemiş`}
              </p>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="w-full text-left rounded-lg bg-[var(--bg-tertiary)] hover:bg-[#3a3a3a] transition-colors flex items-center gap-2"
                  style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                >
                  <span className="text-[var(--text-primary)] flex-1">
                    {itemType === 'food' ? item.name : item.title}
                  </span>
                  {itemType === 'food' && item.recipe_id && (
                    <BookOpen size={13} className="text-[var(--accent)] flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {/* Selected Item Form */}
        {selectedItem && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="bg-[var(--bg-tertiary)] rounded-lg" style={{ padding: '1.25rem' }}>
              <p className="text-[var(--text-primary)] font-medium">
                {itemType === 'food' ? selectedItem.name : selectedItem.title}
              </p>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-sm text-[var(--accent)] hover:underline"
                style={{ marginTop: '0.25rem' }}
              >
                Değiştir
              </button>
            </div>

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

            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
              <Button
                type="submit"
                className="flex-1"
                style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
              >
                Ekle
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
              >
                İptal
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
