import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Edit2, ArrowRight, Search, BookOpen, X } from 'lucide-react'
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

  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [showFoodModal, setShowFoodModal] = useState(false)
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const [editingFood, setEditingFood] = useState(null)
  const [selectedFoodId, setSelectedFoodId] = useState(null)

  const [foodName, setFoodName] = useState('')
  const [foodDefaultUnit, setFoodDefaultUnit] = useState('')

  const [leftQuantity, setLeftQuantity] = useState('1')
  const [leftUnitId, setLeftUnitId] = useState('')
  const [rightItems, setRightItems] = useState([{ equivalent_food_id: '', quantity: '', unit_id: '' }])

  const addRightItem = () =>
    setRightItems(prev => [...prev, { equivalent_food_id: '', quantity: '', unit_id: '' }])

  const updateRightItem = (index, field, value) =>
    setRightItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))

  const removeRightItem = (index) =>
    setRightItems(prev => prev.filter((_, i) => i !== index))

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
    const validItems = rightItems.filter(item => item.equivalent_food_id && item.quantity && item.unit_id)
    if (!selectedFoodId || validItems.length === 0) return

    await addExchange({
      food_id: selectedFoodId,
      quantity_left: parseFloat(leftQuantity) || 1,
      left_unit_id: leftUnitId || null,
      items: validItems.map(item => ({
        equivalent_food_id: item.equivalent_food_id,
        quantity: parseFloat(item.quantity),
        unit_id: item.unit_id
      }))
    })

    resetExchangeForm()
  }

  const resetExchangeForm = () => {
    setLeftQuantity('1')
    setLeftUnitId('')
    setRightItems([{ equivalent_food_id: '', quantity: '', unit_id: '' }])
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

  const migrateExchange = (e) => {
    if (e.items && e.items.length > 0) return e
    if (e.equivalent_food_id) {
      return { ...e, items: [{ equivalent_food_id: e.equivalent_food_id, quantity: e.quantity, unit_id: e.unit_id }] }
    }
    return { ...e, items: [] }
  }

  const getFoodExchangesWithReverse = (foodId) => {
    const outgoing = exchanges
      .map(migrateExchange)
      .filter((e) => e.food_id === foodId)
      .map((e) => ({
        id: e.id,
        direction: 'outgoing',
        leftQty: e.quantity_left ?? 1,
        leftUnitId: e.left_unit_id,
        leftFoodId: e.food_id,
        rightItems: e.items
      }))
    const reverse = exchanges
      .map(migrateExchange)
      .filter((e) => e.items.some(item => item.equivalent_food_id === foodId))
      .map((e) => {
        const match = e.items.find(item => item.equivalent_food_id === foodId)
        return {
          id: `${e.id}-rev`,
          direction: 'reverse',
          leftQty: match.quantity,
          leftUnitId: match.unit_id,
          leftFoodId: match.equivalent_food_id,
          rightItems: [{ equivalent_food_id: e.food_id, quantity: e.quantity_left ?? 1, unit_id: e.left_unit_id }]
        }
      })
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
                    {food.recipe_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/recipes?id=${food.recipe_id}`)}
                        title="Tarife git"
                      >
                        <BookOpen size={16} className="text-[var(--accent)]" />
                      </Button>
                    )}
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
                          key={exchange.id}
                          className="flex items-center justify-between bg-[var(--bg-tertiary)] rounded-lg"
                          style={{ paddingLeft: '1rem', paddingRight: '0.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                        >
                          <div className="flex items-center flex-wrap gap-1 text-sm" style={{ minWidth: 0 }}>
                            <span className="text-[var(--text-primary)]">
                              {exchange.leftQty} {getUnitName(exchange.leftUnitId) || 'porsiyon'} {getFoodName(exchange.leftFoodId)}
                            </span>
                            <ArrowRight size={14} className="text-[var(--accent)] flex-shrink-0" />
                            {exchange.rightItems.map((item, idx) => (
                              <span key={idx} className="text-[var(--text-primary)]">
                                {idx > 0 && <span className="text-[var(--accent)] mx-1">+ </span>}
                                {item.quantity} {getUnitName(item.unit_id) || 'porsiyon'} {getFoodName(item.equivalent_food_id)}
                              </span>
                            ))}
                          </div>
                          {!exchange.id.endsWith('-rev') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteExchange(exchange.id)}
                              className="flex-shrink-0"
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </Button>
                          )}
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

          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]" style={{ margin: 0 }}>
              Eşdeğer (sağ taraf)
            </p>
            <button
              type="button"
              onClick={addRightItem}
              className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <Plus size={13} /> Besin ekle
            </button>
          </div>

          {rightItems.map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {index > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-[var(--bg-tertiary)]" />
                  <span className="text-xs text-[var(--accent)] font-semibold px-2">+</span>
                  <div className="flex-1 border-t border-[var(--bg-tertiary)]" />
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    label={index === 0 ? 'Eşdeğer Besin' : 'Besin'}
                    value={item.equivalent_food_id}
                    onChange={(v) => updateRightItem(index, 'equivalent_food_id', v)}
                    options={foods
                      .filter((f) => f.id !== selectedFoodId)
                      .map((f) => ({ value: f.id, label: f.name }))}
                    placeholder="Besin seçin"
                  />
                </div>
                {rightItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRightItem(index)}
                    style={{ marginBottom: '0.125rem' }}
                  >
                    <X size={15} className="text-red-400" />
                  </Button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Miktar"
                  type="number"
                  value={item.quantity}
                  onChange={(v) => updateRightItem(index, 'quantity', v)}
                  placeholder="örn: 4"
                  step="0.5"
                  min="0"
                />
                <Select
                  label="Birim"
                  value={item.unit_id}
                  onChange={(v) => updateRightItem(index, 'unit_id', v)}
                  options={units.map((u) => ({ value: u.id, label: u.name }))}
                  placeholder="Birim seçin"
                />
              </div>
            </div>
          ))}

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
