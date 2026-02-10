import { useState } from 'react'
import { Plus, Trash2, Edit2, ArrowRight, Search } from 'lucide-react'
import useAppStore from '../stores/appStore'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'

export default function Exchanges() {
  const foods = useAppStore((state) => state.foods)
  const units = useAppStore((state) => state.units)
  const exchanges = useAppStore((state) => state.exchanges)
  const addFood = useAppStore((state) => state.addFood)
  const updateFood = useAppStore((state) => state.updateFood)
  const deleteFood = useAppStore((state) => state.deleteFood)
  const addExchange = useAppStore((state) => state.addExchange)
  const deleteExchange = useAppStore((state) => state.deleteExchange)

  const [searchTerm, setSearchTerm] = useState('')
  const [showFoodModal, setShowFoodModal] = useState(false)
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const [editingFood, setEditingFood] = useState(null)
  const [selectedFoodId, setSelectedFoodId] = useState(null)

  const [foodName, setFoodName] = useState('')
  const [foodDefaultUnit, setFoodDefaultUnit] = useState('')

  const [equivalentFoodId, setEquivalentFoodId] = useState('')
  const [exchangeQuantity, setExchangeQuantity] = useState('')
  const [exchangeUnit, setExchangeUnit] = useState('')

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddFood = async (e) => {
    e.preventDefault()
    if (!foodName.trim()) return

    if (editingFood) {
      await updateFood(editingFood.id, {
        name: foodName.trim(),
        default_unit_id: foodDefaultUnit || null
      })
    } else {
      await addFood({
        name: foodName.trim(),
        default_unit_id: foodDefaultUnit || null
      })
    }

    resetFoodForm()
  }

  const handleDeleteFood = async (id) => {
    if (confirm('Bu besini ve tüm değişimlerini silmek istediğinize emin misiniz?')) {
      await deleteFood(id)
    }
  }

  const handleEditFood = (food) => {
    setEditingFood(food)
    setFoodName(food.name)
    setFoodDefaultUnit(food.default_unit_id || '')
    setShowFoodModal(true)
  }

  const resetFoodForm = () => {
    setEditingFood(null)
    setFoodName('')
    setFoodDefaultUnit('')
    setShowFoodModal(false)
  }

  const handleAddExchange = async (e) => {
    e.preventDefault()
    if (!selectedFoodId || !equivalentFoodId || !exchangeQuantity || !exchangeUnit) return

    await addExchange({
      food_id: selectedFoodId,
      equivalent_food_id: equivalentFoodId,
      quantity: parseFloat(exchangeQuantity),
      unit_id: exchangeUnit
    })

    resetExchangeForm()
  }

  const resetExchangeForm = () => {
    setEquivalentFoodId('')
    setExchangeQuantity('')
    setExchangeUnit('')
    setShowExchangeModal(false)
  }

  const openExchangeModal = (foodId) => {
    setSelectedFoodId(foodId)
    setShowExchangeModal(true)
  }

  const getFoodExchanges = (foodId) => {
    return exchanges.filter((e) => e.food_id === foodId)
  }

  const getUnitName = (unitId) => {
    const unit = units.find((u) => u.id === unitId)
    return unit?.abbreviation || unit?.name || ''
  }

  const getFoodName = (foodId) => {
    const food = foods.find((f) => f.id === foodId)
    return food?.name || ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Değişimler</h1>
        <Button
          onClick={() => setShowFoodModal(true)}
          style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
        >
          <Plus size={18} />
          Besin Ekle
        </Button>
      </div>

      <div className="relative">
        <Search
          className="absolute text-[var(--text-secondary)]"
          size={20}
          style={{ left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Besin ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '3.25rem',
            paddingRight: '1.25rem',
            paddingTop: '0.875rem',
            paddingBottom: '0.875rem',
            boxSizing: 'border-box'
          }}
          className="bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors min-h-[3rem]"
        />
      </div>

      {filteredFoods.length === 0 ? (
        <Card>
          <CardContent className="text-center" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
            <p className="text-[var(--text-secondary)]">
              {searchTerm
                ? 'Arama sonucu bulunamadı.'
                : 'Henüz besin eklenmemiş. Başlamak için "Besin Ekle" butonuna tıklayın.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredFoods.map((food) => {
            const foodExchanges = getFoodExchanges(food.id)
            return (
              <Card key={food.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {food.name}
                    {food.default_unit_id && (
                      <span className="text-sm font-normal text-[var(--text-secondary)]">
                        ({getUnitName(food.default_unit_id)})
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openExchangeModal(food.id)}
                      title="Değişim Ekle"
                    >
                      <Plus size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditFood(food)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFood(food.id)}
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {foodExchanges.length === 0 ? (
                    <p className="text-sm text-[var(--text-secondary)]">
                      Henüz değişim tanımlanmamış.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {foodExchanges.map((exchange) => (
                        <li
                          key={exchange.id}
                          className="flex items-center justify-between bg-[var(--bg-tertiary)] rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-[var(--text-primary)]">1 {getUnitName(food.default_unit_id) || 'porsiyon'}</span>
                            <ArrowRight size={14} className="text-[var(--accent)]" />
                            <span className="text-[var(--text-primary)]">
                              {exchange.quantity} {getUnitName(exchange.unit_id)} {getFoodName(exchange.equivalent_food_id)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteExchange(exchange.id)}
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={showFoodModal}
        onClose={resetFoodForm}
        title={editingFood ? 'Besini Düzenle' : 'Yeni Besin'}
      >
        <form onSubmit={handleAddFood} className="space-y-4">
          <Input
            label="Besin Adı"
            value={foodName}
            onChange={setFoodName}
            placeholder="örn: Ayran"
            autoFocus
          />
          <Select
            label="Varsayılan Birim"
            value={foodDefaultUnit}
            onChange={setFoodDefaultUnit}
            options={units.map((u) => ({ value: u.id, label: u.name }))}
            placeholder="Birim seçin (opsiyonel)"
          />
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              {editingFood ? 'Güncelle' : 'Ekle'}
            </Button>
            <Button type="button" variant="secondary" onClick={resetFoodForm}>
              İptal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showExchangeModal}
        onClose={resetExchangeForm}
        title={`Değişim Ekle - ${getFoodName(selectedFoodId)}`}
      >
        <form onSubmit={handleAddExchange} className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            1 {getUnitName(foods.find(f => f.id === selectedFoodId)?.default_unit_id) || 'porsiyon'} {getFoodName(selectedFoodId)} = ?
          </p>

          <Input
            label="Miktar"
            type="number"
            value={exchangeQuantity}
            onChange={setExchangeQuantity}
            placeholder="örn: 4"
            step="0.5"
            min="0"
          />

          <Select
            label="Birim"
            value={exchangeUnit}
            onChange={setExchangeUnit}
            options={units.map((u) => ({ value: u.id, label: u.name }))}
          />

          <Select
            label="Eşdeğer Besin"
            value={equivalentFoodId}
            onChange={setEquivalentFoodId}
            options={foods
              .filter((f) => f.id !== selectedFoodId)
              .map((f) => ({ value: f.id, label: f.name }))}
          />

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Değişim Ekle
            </Button>
            <Button type="button" variant="secondary" onClick={resetExchangeForm}>
              İptal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
