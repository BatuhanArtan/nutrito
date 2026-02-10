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

  const [leftQuantity, setLeftQuantity] = useState('1')
  const [leftUnitId, setLeftUnitId] = useState('')
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
      quantity_left: parseFloat(leftQuantity) || 1,
      left_unit_id: leftUnitId || null,
      equivalent_food_id: equivalentFoodId,
      quantity: parseFloat(exchangeQuantity),
      unit_id: exchangeUnit
    })

    resetExchangeForm()
  }

  const resetExchangeForm = () => {
    setLeftQuantity('1')
    setLeftUnitId('')
    setEquivalentFoodId('')
    setExchangeQuantity('')
    setExchangeUnit('')
    setShowExchangeModal(false)
  }

  const openExchangeModal = (foodId) => {
    setSelectedFoodId(foodId)
    setShowExchangeModal(true)
  }

  const getUnitName = (unitId) => {
    const unit = units.find((u) => u.id === unitId)
    return unit?.abbreviation || unit?.name || ''
  }

  const getFoodExchangesWithReverse = (foodId) => {
    const outgoing = exchanges
      .filter((e) => e.food_id === foodId)
      .map((e) => ({
        ...e,
        direction: 'outgoing',
        leftQty: e.quantity_left ?? 1,
        leftUnitId: e.left_unit_id,
        rightQty: e.quantity,
        rightUnitId: e.unit_id,
        leftFoodId: e.food_id,
        rightFoodId: e.equivalent_food_id
      }))
    const reverse = exchanges
      .filter((e) => e.equivalent_food_id === foodId)
      .map((e) => ({
        ...e,
        direction: 'reverse',
        leftQty: e.quantity,
        leftUnitId: e.unit_id,
        rightQty: e.quantity_left ?? 1,
        rightUnitId: e.left_unit_id,
        leftFoodId: e.equivalent_food_id,
        rightFoodId: e.food_id
      }))
    return [...outgoing, ...reverse]
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
            const foodExchanges = getFoodExchangesWithReverse(food.id)
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
                    <p className="text-sm text-[var(--text-secondary)]" style={{ paddingTop: '0.25rem', paddingBottom: '0.25rem' }}>
                      Henüz değişim tanımlanmamış.
                    </p>
                  ) : (
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                      {foodExchanges.map((exchange) => (
                        <li
                          key={`${exchange.id}-${exchange.direction}`}
                          className="flex items-center justify-between bg-[var(--bg-tertiary)] rounded-lg"
                          style={{ paddingLeft: '1rem', paddingRight: '0.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                        >
                          <div className="flex items-center gap-2 text-sm" style={{ minWidth: 0 }}>
                            <span className="text-[var(--text-primary)]">
                              {exchange.leftQty} {getUnitName(exchange.leftUnitId) || 'porsiyon'} {getFoodName(exchange.leftFoodId)}
                            </span>
                            <ArrowRight size={14} className="text-[var(--accent)] flex-shrink-0" />
                            <span className="text-[var(--text-primary)]">
                              {exchange.rightQty} {getUnitName(exchange.rightUnitId) || 'porsiyon'} {getFoodName(exchange.rightFoodId)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteExchange(exchange.id)}
                            className="flex-shrink-0"
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
        <form onSubmit={handleAddFood} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
            <Button
              type="submit"
              className="flex-1"
              style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              {editingFood ? 'Güncelle' : 'Ekle'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={resetFoodForm}
              style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
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
        <form onSubmit={handleAddExchange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p className="text-sm text-[var(--text-secondary)]" style={{ marginBottom: '0' }}>
            Sol taraf (bu besin): {getFoodName(selectedFoodId)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Miktar"
              type="number"
              value={leftQuantity}
              onChange={setLeftQuantity}
              placeholder="1"
              step="0.5"
              min="0"
            />
            <Select
              label="Birim"
              value={leftUnitId}
              onChange={setLeftUnitId}
              options={units.map((u) => ({ value: u.id, label: u.name }))}
              placeholder="Birim seçin"
            />
          </div>

          <p className="text-sm text-[var(--text-secondary)]" style={{ marginBottom: '0' }}>
            Eşdeğer (sağ taraf)
          </p>
          <Select
            label="Eşdeğer Besin"
            value={equivalentFoodId}
            onChange={setEquivalentFoodId}
            options={foods
              .filter((f) => f.id !== selectedFoodId)
              .map((f) => ({ value: f.id, label: f.name }))}
            placeholder="Besin seçin"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              placeholder="Birim seçin"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
            <Button
              type="submit"
              className="flex-1"
              style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              Değişim Ekle
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={resetExchangeForm}
              style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              İptal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
