import { useState, useMemo } from 'react'
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

    await addRecipeCategory({
      name: categoryName.trim(),
      color: categoryColor
    })

    setCategoryName('')
    setCategoryColor('#e07a5f')
    setShowCategoryModal(false)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tarifler</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowCategoryModal(true)}>
            <Plus size={18} />
            Kategori
          </Button>
          <Button onClick={() => setShowRecipeModal(true)}>
            <Plus size={18} />
            Tarif Ekle
          </Button>
        </div>
      </div>

      <Button
        onClick={handleHungry}
        className="w-full py-4 text-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] hover:opacity-90"
        disabled={filteredRecipes.length === 0}
      >
        <Shuffle size={24} />
        ACIKTIM! Bana bir tarif öner
      </Button>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
          <input
            type="text"
            placeholder="Tarif ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg pl-10 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors"
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
        <div className="flex flex-wrap gap-2">
          {recipeCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: category.color + '20', color: category.color }}
            >
              <span>{category.name}</span>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="hover:opacity-70"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {filteredRecipes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-[var(--text-secondary)]">
              {searchTerm || selectedCategory
                ? 'Arama sonucu bulunamadı.'
                : 'Henüz tarif eklenmemiş. Başlamak için "Tarif Ekle" butonuna tıklayın.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => {
            const category = getCategoryById(recipe.category_id)
            const isExpanded = expandedRecipes.has(recipe.id)

            return (
              <Card key={recipe.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{recipe.title}</CardTitle>
                    {category && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        {category.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRecipeExpand(recipe.id)}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditRecipe(recipe)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRecipe(recipe.id)}
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
        <form onSubmit={handleAddRecipe} className="space-y-4">
          <Input
            label="Tarif Adı"
            value={recipeTitle}
            onChange={setRecipeTitle}
            placeholder="örn: Yoğurtlu Salata"
            autoFocus
          />
          <Select
            label="Kategori"
            value={recipeCategory}
            onChange={setRecipeCategory}
            options={recipeCategories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Kategori seçin (opsiyonel)"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-secondary)]">Malzemeler</label>
            <textarea
              value={recipeIngredients}
              onChange={(e) => setRecipeIngredients(e.target.value)}
              placeholder="Her satıra bir malzeme..."
              rows={4}
              className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-secondary)]">Yapılışı</label>
            <textarea
              value={recipeInstructions}
              onChange={(e) => setRecipeInstructions(e.target.value)}
              placeholder="Tarif adımları..."
              rows={4}
              className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              {editingRecipe ? 'Güncelle' : 'Ekle'}
            </Button>
            <Button type="button" variant="secondary" onClick={resetRecipeForm}>
              İptal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Yeni Kategori"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <Input
            label="Kategori Adı"
            value={categoryName}
            onChange={setCategoryName}
            placeholder="örn: Salatalar"
            autoFocus
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-secondary)]">Renk</label>
            <input
              type="color"
              value={categoryColor}
              onChange={(e) => setCategoryColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Ekle
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowCategoryModal(false)}>
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
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[var(--accent)]">{randomRecipe.title}</h3>
              {getCategoryById(randomRecipe.category_id) && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm mt-2"
                  style={{
                    backgroundColor: getCategoryById(randomRecipe.category_id).color + '20',
                    color: getCategoryById(randomRecipe.category_id).color
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

            <Button onClick={handleHungry} className="w-full">
              <Shuffle size={18} />
              Başka bir tarif öner
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
