import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Trash2, Edit2, Search, Shuffle, ChevronDown, ChevronUp } from 'lucide-react'
import useAppStore from '../stores/appStore'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'

export default function Recipes() {
  const recipes = useAppStore((state) => state.recipes)
  const recipeCategories = useAppStore((state) => state.recipeCategories)
  const addRecipe = useAppStore((state) => state.addRecipe)
  const updateRecipe = useAppStore((state) => state.updateRecipe)
  const deleteRecipe = useAppStore((state) => state.deleteRecipe)
  const addRecipeCategory = useAppStore((state) => state.addRecipeCategory)
  const deleteRecipeCategory = useAppStore((state) => state.deleteRecipeCategory)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showRandomRecipe, setShowRandomRecipe] = useState(false)
  const [randomRecipe, setRandomRecipe] = useState(null)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [expandedRecipes, setExpandedRecipes] = useState(new Set())

  const [recipeTitle, setRecipeTitle] = useState('')
  const [recipeCategory, setRecipeCategory] = useState('')
  const [recipeIngredients, setRecipeIngredients] = useState('')
  const [recipeInstructions, setRecipeInstructions] = useState('')

  const [categoryName, setCategoryName] = useState('')
  const [categoryColor, setCategoryColor] = useState('#e07a5f')
  const [addingCategoryForRecipe, setAddingCategoryForRecipe] = useState(false)

  const [searchParams] = useSearchParams()
  useEffect(() => {
    const targetId = searchParams.get('id')
    if (!targetId) return
    setExpandedRecipes((prev) => new Set([...prev, targetId]))
    setTimeout(() => {
      const el = document.getElementById(`recipe-${targetId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [searchParams])

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || recipe.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [recipes, searchTerm, selectedCategory])

  const handleAddRecipe = async (e) => {
    e.preventDefault()
    if (!recipeTitle.trim()) return

    const recipeData = {
      title: recipeTitle.trim(),
      category_id: recipeCategory || null,
      ingredients: recipeIngredients.trim(),
      instructions: recipeInstructions.trim()
    }

    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, recipeData)
    } else {
      await addRecipe(recipeData)
    }

    resetRecipeForm()
  }

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe)
    setRecipeTitle(recipe.title)
    setRecipeCategory(recipe.category_id || '')
    setRecipeIngredients(recipe.ingredients || '')
    setRecipeInstructions(recipe.instructions || '')
    setShowRecipeModal(true)
  }

  const handleDeleteRecipe = async (id) => {
    if (confirm('Bu tarifi silmek istediğinize emin misiniz?')) {
      await deleteRecipe(id)
    }
  }

  const resetRecipeForm = () => {
    setEditingRecipe(null)
    setRecipeTitle('')
    setRecipeCategory('')
    setRecipeIngredients('')
    setRecipeInstructions('')
    setShowRecipeModal(false)
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    const newCategory = await addRecipeCategory({
      name: categoryName.trim(),
      color: categoryColor
    })

    setCategoryName('')
    setCategoryColor('#e07a5f')
    setShowCategoryModal(false)
    if (addingCategoryForRecipe && newCategory) {
      setRecipeCategory(newCategory.id)
      setAddingCategoryForRecipe(false)
    }
  }

  const openNewCategoryFromRecipe = () => {
    setAddingCategoryForRecipe(true)
    setShowCategoryModal(true)
  }

  const closeCategoryModal = () => {
    setShowCategoryModal(false)
    setAddingCategoryForRecipe(false)
  }

  const handleDeleteCategory = async (id) => {
    if (confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      await deleteRecipeCategory(id)
    }
  }

  const handleHungry = () => {
    if (filteredRecipes.length === 0) return
    const randomIndex = Math.floor(Math.random() * filteredRecipes.length)
    setRandomRecipe(filteredRecipes[randomIndex])
    setShowRandomRecipe(true)
  }

  const toggleRecipeExpand = (recipeId) => {
    const newExpanded = new Set(expandedRecipes)
    if (newExpanded.has(recipeId)) {
      newExpanded.delete(recipeId)
    } else {
      newExpanded.add(recipeId)
    }
    setExpandedRecipes(newExpanded)
  }

  const getCategoryById = (categoryId) => {
    return recipeCategories.find((c) => c.id === categoryId)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tarifler</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            onClick={() => setShowCategoryModal(true)}
            style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          >
            <Plus size={18} />
            Kategori
          </Button>
          <Button
            onClick={() => setShowRecipeModal(true)}
            style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          >
            <Plus size={18} />
            Tarif Ekle
          </Button>
        </div>
      </div>

      <Button
        onClick={handleHungry}
        className="w-full text-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] hover:opacity-90"
        style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
        disabled={filteredRecipes.length === 0}
      >
        <Shuffle size={24} />
        ACIKTIM!
      </Button>

      <div className="flex flex-col md:flex-row md:flex-wrap" style={{ gap: '1rem' }}>
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute text-[var(--text-secondary)]"
            size={20}
            style={{ left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Tarif ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '3.25rem',
              paddingRight: '1.25rem',
              paddingTop: '0.875rem',
              paddingBottom: '0.875rem',
              minHeight: '3rem',
              boxSizing: 'border-box'
            }}
            className="bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <Select
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={[
            { value: '', label: 'Tüm Kategoriler' },
            ...recipeCategories.map((c) => ({ value: c.id, label: c.name }))
          ]}
          className="md:w-48"
        />
      </div>

      {recipeCategories.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', margin: 0 }}>
          {recipeCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center rounded-full text-sm"
              style={{
                backgroundColor: category.color + '20',
                color: category.color,
                paddingLeft: '0.75rem',
                paddingRight: '0.5rem',
                paddingTop: '0.375rem',
                paddingBottom: '0.375rem',
                gap: '0.375rem',
                margin: 0
              }}
            >
              <span>{category.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(category.id)}
                className="hover:opacity-70 flex-shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {filteredRecipes.length === 0 ? (
        <Card>
          <CardContent className="text-center" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
            <p className="text-[var(--text-secondary)]">
              {searchTerm || selectedCategory
                ? 'Arama sonucu bulunamadı.'
                : 'Henüz tarif eklenmemiş. Başlamak için "Tarif Ekle" butonuna tıklayın.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRecipes.map((recipe) => {
            const category = getCategoryById(recipe.category_id)
            const isExpanded = expandedRecipes.has(recipe.id)

            return (
              <Card key={recipe.id} id={`recipe-${recipe.id}`}>
                <CardHeader>
                  <button
                    type="button"
                    className="flex items-center flex-wrap flex-1 text-left"
                    style={{ gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: 0 }}
                    onClick={() => toggleRecipeExpand(recipe.id)}
                  >
                    <CardTitle style={{ margin: 0 }}>{recipe.title}</CardTitle>
                    {category && (
                      <span
                        style={{
                          display: 'inline-block',
                          flexShrink: 0,
                          backgroundColor: category.color + '25',
                          color: category.color,
                          border: `1px solid ${category.color}50`,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          marginLeft: '0.75rem'
                        }}
                      >
                        {category.name}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={14} className="text-[var(--text-secondary)] shrink-0" /> : <ChevronDown size={14} className="text-[var(--text-secondary)] shrink-0" />}
                  </button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleEditRecipe(recipe) }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleDeleteRecipe(recipe.id) }}
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 border-t border-[var(--bg-tertiary)] pt-4 mt-2">
                    {recipe.ingredients && (
                      <div>
                        <h4 className="font-medium text-[var(--text-primary)] mb-2">Malzemeler</h4>
                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                          {recipe.ingredients}
                        </p>
                      </div>
                    )}
                    {recipe.instructions && (
                      <div>
                        <h4 className="font-medium text-[var(--text-primary)] mb-2">Yapılışı</h4>
                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                          {recipe.instructions}
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={showRecipeModal}
        onClose={resetRecipeForm}
        title={editingRecipe ? 'Tarifi Düzenle' : 'Yeni Tarif'}
        className="max-w-lg"
      >
        <form onSubmit={handleAddRecipe} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Tarif Adı"
            value={recipeTitle}
            onChange={setRecipeTitle}
            placeholder="örn: Yoğurtlu Salata"
            autoFocus
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <label className="text-sm text-[var(--text-secondary)]">Kategori</label>
              <button
                type="button"
                onClick={openNewCategoryFromRecipe}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                + Yeni kategori
              </button>
            </div>
            <Select
              value={recipeCategory}
              onChange={setRecipeCategory}
              options={recipeCategories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Kategori seçin (opsiyonel)"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="text-sm text-[var(--text-secondary)]">Malzemeler</label>
            <textarea
              value={recipeIngredients}
              onChange={(e) => setRecipeIngredients(e.target.value)}
              placeholder="Her satıra bir malzeme..."
              rows={4}
              className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="text-sm text-[var(--text-secondary)]">Yapılışı</label>
            <textarea
              value={recipeInstructions}
              onChange={(e) => setRecipeInstructions(e.target.value)}
              placeholder="Tarif adımları..."
              rows={4}
              className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
            <Button
              type="submit"
              className="flex-1"
              style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              {editingRecipe ? 'Güncelle' : 'Ekle'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={resetRecipeForm}
              style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              İptal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showCategoryModal}
        onClose={closeCategoryModal}
        title="Yeni Kategori"
      >
        <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Kategori Adı"
            value={categoryName}
            onChange={setCategoryName}
            placeholder="örn: Salatalar"
            autoFocus
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="text-sm text-[var(--text-secondary)]">Renk</label>
            <input
              type="color"
              value={categoryColor}
              onChange={(e) => setCategoryColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
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
              onClick={() => setShowCategoryModal(false)}
              style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              İptal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showRandomRecipe}
        onClose={() => setShowRandomRecipe(false)}
        title="Bugünkü Tarifin"
        className="max-w-lg"
      >
        {randomRecipe && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 className="text-2xl font-bold text-[var(--accent)]">{randomRecipe.title}</h3>
              {getCategoryById(randomRecipe.category_id) && (
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.875rem',
                    borderRadius: '999px',
                    fontSize: '0.8125rem',
                    backgroundColor: getCategoryById(randomRecipe.category_id).color + '25',
                    color: getCategoryById(randomRecipe.category_id).color,
                    border: `1px solid ${getCategoryById(randomRecipe.category_id).color}50`
                  }}
                >
                  {getCategoryById(randomRecipe.category_id).name}
                </span>
              )}
            </div>

            {randomRecipe.ingredients && (
              <div>
                <h4 className="font-medium text-[var(--text-primary)] mb-2">Malzemeler</h4>
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                  {randomRecipe.ingredients}
                </p>
              </div>
            )}

            {randomRecipe.instructions && (
              <div>
                <h4 className="font-medium text-[var(--text-primary)] mb-2">Yapılışı</h4>
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                  {randomRecipe.instructions}
                </p>
              </div>
            )}

            <Button onClick={handleHungry} style={{ width: '100%', marginTop: '0.5rem' }}>
              <Shuffle size={18} />
              Başka bir tarif öner
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
