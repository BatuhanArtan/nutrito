import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getToday, generateId, toDateStr, DEFAULT_UNITS, DEFAULT_UNIT_IDS } from '../lib/utils'

const useAppStore = create(
  persist(
    (set, get) => ({
      // Current date for tracking
      currentDate: getToday(),
      setCurrentDate: (date) => set({ currentDate: date }),

      // Units (varsayılan birimlerle başlar)
      units: [...DEFAULT_UNITS],
      setUnits: (units) => set({ units }),

      // Foods
      foods: [],
      setFoods: (foods) => set({ foods }),

      // Food Exchanges
      exchanges: [],
      setExchanges: (exchanges) => set({ exchanges }),

      // Recipes
      recipes: [],
      setRecipes: (recipes) => set({ recipes }),

      // Recipe Categories
      recipeCategories: [],
      setRecipeCategories: (categories) => set({ recipeCategories: categories }),

      // Daily Meals
      dailyMeals: [],
      setDailyMeals: (meals) => set({ dailyMeals: meals }),

      // Meal Items
      mealItems: [],
      setMealItems: (items) => set({ mealItems: items }),

      // Water Logs
      waterLogs: [],
      setWaterLogs: (logs) => set({ waterLogs: logs }),

      // Weight Logs
      weightLogs: [],
      setWeightLogs: (logs) => set({ weightLogs: logs }),

      // Su ayarları (persist)
      waterTargetDefault: 8,
      setWaterTargetDefault: (n) => set({ waterTargetDefault: Math.max(1, Math.min(99, Number(n) || 8)) }),
      waterGlassVolumeMl: 200,
      setWaterGlassVolumeMl: (n) => set({ waterGlassVolumeMl: Math.max(50, Math.min(500, Number(n) || 200)) }),

      // Loading state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Initialize data from Supabase
      initializeData: async () => {
        if (!isSupabaseConfigured()) {
          console.warn('Supabase not configured. Using local storage only.')
          return
        }

        set({ isLoading: true })
        try {
          const [
            { data: units },
            { data: foods },
            { data: exchanges },
            { data: recipes },
            { data: categories },
            { data: dailyMeals },
            { data: mealItems },
            { data: waterLogs },
            { data: weightLogs }
          ] = await Promise.all([
            supabase.from('units').select('*').order('name'),
            supabase.from('foods').select('*').order('name'),
            supabase.from('food_exchanges').select('*'),
            supabase.from('recipes').select('*').order('title'),
            supabase.from('recipe_categories').select('*').order('name'),
            supabase.from('daily_meals').select('*'),
            supabase.from('meal_items').select('*'),
            supabase.from('water_logs').select('*').order('date', { ascending: false }),
            supabase.from('weight_logs').select('*').order('date', { ascending: false })
          ])

          set({
            units: (units?.length ? units : DEFAULT_UNITS),
            foods: foods || [],
            exchanges: exchanges || [],
            recipes: recipes || [],
            recipeCategories: categories || [],
            dailyMeals: dailyMeals || [],
            mealItems: mealItems || [],
            waterLogs: waterLogs || [],
            weightLogs: weightLogs || []
          })
        } catch (error) {
          console.error('Error initializing data:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Yerel verileri Supabase'e tek seferlik gönder (ilk bağlantı sonrası)
      pushLocalDataToSupabase: async () => {
        if (!isSupabaseConfigured()) return
        const state = get()
        const tables = [
          { name: 'units', data: state.units, onConflict: 'id' },
          { name: 'recipe_categories', data: state.recipeCategories, onConflict: 'id' },
          { name: 'foods', data: state.foods, onConflict: 'id' },
          { name: 'food_exchanges', data: state.exchanges, onConflict: 'id' },
          { name: 'recipes', data: state.recipes, onConflict: 'id' },
          { name: 'daily_meals', data: state.dailyMeals, onConflict: 'id' },
          { name: 'meal_items', data: state.mealItems, onConflict: 'id' },
          { name: 'water_logs', data: state.waterLogs, onConflict: 'date' },
          { name: 'weight_logs', data: state.weightLogs, onConflict: 'date' }
        ]
        for (const { name, data, onConflict } of tables) {
          if (!data?.length) continue
          const { error } = await supabase.from(name).upsert(data, { onConflict })
          if (error) throw new Error(`${name}: ${error.message}`)
        }
      },

      // CRUD Operations with Supabase sync

      // Units
      addUnit: async (unit) => {
        const newUnit = { ...unit, id: generateId(), created_at: new Date().toISOString() }
        set((state) => ({ units: [...state.units, newUnit] }))

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.from('units').insert(newUnit).select().single()
          if (error) console.error('Error adding unit:', error)
          else set((state) => ({ units: state.units.map(u => u.id === newUnit.id ? data : u) }))
        }
        return newUnit
      },

      updateUnit: async (id, updates) => {
        set((state) => ({
          units: state.units.map(u => u.id === id ? { ...u, ...updates } : u)
        }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('units').update(updates).eq('id', id)
          if (error) console.error('Error updating unit:', error)
        }
      },

      deleteUnit: async (id) => {
        if (DEFAULT_UNIT_IDS.has(id)) return
        set((state) => ({ units: state.units.filter(u => u.id !== id) }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('units').delete().eq('id', id)
          if (error) console.error('Error deleting unit:', error)
        }
      },

      // Foods
      addFood: async (food) => {
        const newFood = { ...food, id: generateId(), created_at: new Date().toISOString() }
        set((state) => ({ foods: [...state.foods, newFood] }))

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.from('foods').insert(newFood).select().single()
          if (error) console.error('Error adding food:', error)
          else set((state) => ({ foods: state.foods.map(f => f.id === newFood.id ? data : f) }))
        }
        return newFood
      },

      updateFood: async (id, updates) => {
        set((state) => ({
          foods: state.foods.map(f => f.id === id ? { ...f, ...updates } : f)
        }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('foods').update(updates).eq('id', id)
          if (error) console.error('Error updating food:', error)
        }
      },

      deleteFood: async (id) => {
        set((state) => ({ foods: state.foods.filter(f => f.id !== id) }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('foods').delete().eq('id', id)
          if (error) console.error('Error deleting food:', error)
        }
      },

      // Food Exchanges
      addExchange: async (exchange) => {
        const newExchange = {
          ...exchange,
          quantity_left: exchange.quantity_left ?? 1,
          left_unit_id: exchange.left_unit_id || null,
          id: generateId(),
          created_at: new Date().toISOString()
        }
        set((state) => ({ exchanges: [...state.exchanges, newExchange] }))

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.from('food_exchanges').insert(newExchange).select().single()
          if (error) console.error('Error adding exchange:', error)
          else set((state) => ({ exchanges: state.exchanges.map(e => e.id === newExchange.id ? data : e) }))
        }
        return newExchange
      },

      deleteExchange: async (id) => {
        set((state) => ({ exchanges: state.exchanges.filter(e => e.id !== id) }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('food_exchanges').delete().eq('id', id)
          if (error) console.error('Error deleting exchange:', error)
        }
      },

      // Recipe Categories
      addRecipeCategory: async (category) => {
        const newCategory = { ...category, id: generateId(), created_at: new Date().toISOString() }
        set((state) => ({ recipeCategories: [...state.recipeCategories, newCategory] }))

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.from('recipe_categories').insert(newCategory).select().single()
          if (error) console.error('Error adding category:', error)
          else set((state) => ({ recipeCategories: state.recipeCategories.map(c => c.id === newCategory.id ? data : c) }))
        }
        return newCategory
      },

      deleteRecipeCategory: async (id) => {
        set((state) => ({ recipeCategories: state.recipeCategories.filter(c => c.id !== id) }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('recipe_categories').delete().eq('id', id)
          if (error) console.error('Error deleting category:', error)
        }
      },

      // Recipes
      addRecipe: async (recipe) => {
        const newRecipe = { ...recipe, id: generateId(), created_at: new Date().toISOString() }
        set((state) => ({ recipes: [...state.recipes, newRecipe] }))

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.from('recipes').insert(newRecipe).select().single()
          if (error) console.error('Error adding recipe:', error)
          else set((state) => ({ recipes: state.recipes.map(r => r.id === newRecipe.id ? data : r) }))
        }
        return newRecipe
      },

      updateRecipe: async (id, updates) => {
        set((state) => ({
          recipes: state.recipes.map(r => r.id === id ? { ...r, ...updates } : r)
        }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('recipes').update(updates).eq('id', id)
          if (error) console.error('Error updating recipe:', error)
        }
      },

      deleteRecipe: async (id) => {
        set((state) => ({ recipes: state.recipes.filter(r => r.id !== id) }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('recipes').delete().eq('id', id)
          if (error) console.error('Error deleting recipe:', error)
        }
      },

      // Daily Meals
      getOrCreateDailyMeal: async (date, mealType) => {
        const { dailyMeals } = get()
        const dateNorm = toDateStr(date)
        let meal = dailyMeals.find(m => toDateStr(m.date) === dateNorm && m.meal_type === mealType)

        if (!meal) {
          meal = { id: generateId(), date: dateNorm || date, meal_type: mealType, created_at: new Date().toISOString() }
          set((state) => ({ dailyMeals: [...state.dailyMeals, meal] }))

          if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from('daily_meals').insert(meal).select().single()
            if (error) console.error('Error creating daily meal:', error)
            else set((state) => ({ dailyMeals: state.dailyMeals.map(m => m.id === meal.id ? data : m) }))
          }
        }

        return meal
      },

      // Meal Items
      addMealItem: async (item) => {
        const newItem = { ...item, id: generateId(), created_at: new Date().toISOString() }
        set((state) => ({ mealItems: [...state.mealItems, newItem] }))

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.from('meal_items').insert(newItem).select().single()
          if (error) console.error('Error adding meal item:', error)
          else set((state) => ({ mealItems: state.mealItems.map(i => i.id === newItem.id ? data : i) }))
        }
        return newItem
      },

      updateMealItem: async (id, updates) => {
        set((state) => ({
          mealItems: state.mealItems.map(i => i.id === id ? { ...i, ...updates } : i)
        }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('meal_items').update(updates).eq('id', id)
          if (error) console.error('Error updating meal item:', error)
        }
      },

      deleteMealItem: async (id) => {
        set((state) => ({ mealItems: state.mealItems.filter(i => i.id !== id) }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('meal_items').delete().eq('id', id)
          if (error) console.error('Error deleting meal item:', error)
        }
      },

      copyMealsFromDate: async (sourceDate, targetDate) => {
        const { dailyMeals, mealItems, getOrCreateDailyMeal, addMealItem, deleteMealItem } = get()
        const src = toDateStr(sourceDate)
        const tgt = toDateStr(targetDate)
        const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner']

        const targetMeals = dailyMeals.filter(m => toDateStr(m.date) === tgt)
        const targetMealIds = new Set(targetMeals.map(m => m.id))
        const idsToRemove = mealItems
          .filter(i => targetMealIds.has(i.daily_meal_id))
          .map(i => i.id)
        for (const id of idsToRemove) {
          await deleteMealItem(id)
        }

        const { mealItems: itemsAfterClear } = get()
        let copied = 0
        for (const mealType of mealTypes) {
          const sourceMeal = dailyMeals.find(m => toDateStr(m.date) === src && m.meal_type === mealType)
          if (!sourceMeal) continue
          const items = itemsAfterClear.filter(i => i.daily_meal_id === sourceMeal.id)
          const targetMeal = await getOrCreateDailyMeal(tgt, mealType)
          for (const item of items) {
            await addMealItem({
              daily_meal_id: targetMeal.id,
              food_id: item.food_id || null,
              recipe_id: item.recipe_id || null,
              quantity: item.quantity,
              unit_id: item.unit_id || null
            })
            copied++
          }
        }
        return copied
      },

      // Water Logs
      getOrCreateWaterLog: async (date) => {
        const { waterLogs } = get()
        let log = waterLogs.find(l => l.date === date)

        if (!log) {
          const target = get().waterTargetDefault ?? 8
          log = { id: generateId(), date, glasses: 0, target, created_at: new Date().toISOString() }
          set((state) => ({ waterLogs: [...state.waterLogs, log] }))

          if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from('water_logs').insert(log).select().single()
            if (error) console.error('Error creating water log:', error)
            else set((state) => ({ waterLogs: state.waterLogs.map(l => l.id === log.id ? data : l) }))
          }
        }

        return log
      },

      updateWaterLog: async (date, updates) => {
        set((state) => ({
          waterLogs: state.waterLogs.map(l => l.date === date ? { ...l, ...updates } : l)
        }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('water_logs').update(updates).eq('date', date)
          if (error) console.error('Error updating water log:', error)
        }
      },

      // Weight Logs
      addWeightLog: async (log) => {
        const { weightLogs } = get()
        const existingIndex = weightLogs.findIndex(l => l.date === log.date)

        if (existingIndex >= 0) {
          // Update existing log
          set((state) => ({
            weightLogs: state.weightLogs.map(l => l.date === log.date ? { ...l, weight: log.weight } : l)
          }))

          if (isSupabaseConfigured()) {
            const { error } = await supabase.from('weight_logs').update({ weight: log.weight }).eq('date', log.date)
            if (error) console.error('Error updating weight log:', error)
          }
        } else {
          // Create new log
          const newLog = { ...log, id: generateId(), created_at: new Date().toISOString() }
          set((state) => ({ weightLogs: [newLog, ...state.weightLogs] }))

          if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from('weight_logs').insert(newLog).select().single()
            if (error) console.error('Error adding weight log:', error)
            else set((state) => ({ weightLogs: state.weightLogs.map(l => l.id === newLog.id ? data : l) }))
          }
        }
      },

      deleteWeightLog: async (id) => {
        set((state) => ({ weightLogs: state.weightLogs.filter(l => l.id !== id) }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('weight_logs').delete().eq('id', id)
          if (error) console.error('Error deleting weight log:', error)
        }
      },

      // Get exchanges for a specific food (hem giden hem gelen / tersinir)
      getExchangesForFood: (foodId) => {
        const { exchanges, foods, units } = get()
        const getUnit = (id) => (id ? units.find(u => u.id === id) : null)
        const getFood = (id) => foods.find(f => f.id === id)
        const result = []
        exchanges.filter(e => e.food_id === foodId).forEach(e => {
          result.push({
            id: e.id,
            leftQuantity: e.quantity_left ?? 1,
            leftUnit: getUnit(e.left_unit_id),
            rightQuantity: e.quantity,
            rightUnit: getUnit(e.unit_id),
            leftFood: getFood(e.food_id),
            rightFood: getFood(e.equivalent_food_id)
          })
        })
        exchanges.filter(e => e.equivalent_food_id === foodId).forEach(e => {
          result.push({
            id: e.id,
            leftQuantity: e.quantity,
            leftUnit: getUnit(e.unit_id),
            rightQuantity: e.quantity_left ?? 1,
            rightUnit: getUnit(e.left_unit_id),
            leftFood: getFood(e.equivalent_food_id),
            rightFood: getFood(e.food_id)
          })
        })
        return result
      },

      // Get meal items for a specific date and meal type
      getMealItemsForMeal: (date, mealType) => {
        const { dailyMeals, mealItems, foods, recipes, units } = get()
        const dateNorm = toDateStr(date)
        const meal = dailyMeals.find(m => toDateStr(m.date) === dateNorm && m.meal_type === mealType)

        if (!meal) return []

        return mealItems
          .filter(item => item.daily_meal_id === meal.id)
          .map(item => ({
            ...item,
            food: foods.find(f => f.id === item.food_id),
            recipe: recipes.find(r => r.id === item.recipe_id),
            unit: units.find(u => u.id === item.unit_id)
          }))
      }
    }),
    {
      name: 'nutrito-storage',
      partialize: (state) => ({
        units: state.units?.length ? state.units : DEFAULT_UNITS,
        foods: state.foods,
        exchanges: state.exchanges,
        recipes: state.recipes,
        recipeCategories: state.recipeCategories,
        dailyMeals: state.dailyMeals,
        mealItems: state.mealItems,
        waterLogs: state.waterLogs,
        weightLogs: state.weightLogs,
        waterTargetDefault: state.waterTargetDefault,
        waterGlassVolumeMl: state.waterGlassVolumeMl
      }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        units: persisted?.units?.length ? persisted.units : (current.units || DEFAULT_UNITS)
      })
    }
  )
)

export default useAppStore
