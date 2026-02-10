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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Değişimler</h1>
        <Button onClick={() => setShowFoodModal(true)}>
          <Plus size={18} />
          Besin Ekle
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
        <input
          type="text"
          placeholder="Besin ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg pl-10 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors"
        />
      </div>

      {filteredFoods.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-[var(--text-secondary)]">
              {searchTerm
                ? 'Arama sonucu bulunamadı.'
                : 'Henüz besin eklenmemiş. Başlamak için "Besin Ekle" butonuna tıklayın.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
