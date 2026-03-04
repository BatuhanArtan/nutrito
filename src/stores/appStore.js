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

      // Tamamlanan öğünler — key: "date_mealType", value: true (UI için; DB'de daily_meals.completed + completed_at)
      completedMeals: {},
      skippedMeals: {},
      toggleMealCompleted: async (date, mealType) => {
        const key = `${toDateStr(date)}_${mealType}`
        let meal = get().dailyMeals.find(m => toDateStr(m.date) === toDateStr(date) && m.meal_type === mealType)
        if (!meal) meal = await get().getOrCreateDailyMeal(date, mealType)
        const current = meal?.completed ?? get().completedMeals[key] ?? false
        const next = !current
        const skippedKey = `${toDateStr(date)}_${mealType}`
        set((state) => ({
          completedMeals: { ...state.completedMeals, [key]: next },
          // Tamamlandı işaretlenince Atlandı kaldırılır
          skippedMeals: next ? { ...state.skippedMeals, [skippedKey]: false } : state.skippedMeals,
          dailyMeals: state.dailyMeals.map((m) =>
            m.id === meal.id ? { ...m, completed: next, completed_at: next ? (m.completed_at ?? null) : null, skipped: next ? false : m.skipped } : m
          )
        }))
        if (isSupabaseConfigured()) {
          await supabase.from('daily_meals').update({
            completed: next,
            completed_at: next ? (meal.completed_at ?? null) : null,
            ...(next && { skipped: false })
          }).eq('id', meal.id)
        }
      },
      toggleMealSkipped: async (date, mealType) => {
        const key = `${toDateStr(date)}_${mealType}`
        let meal = get().dailyMeals.find(m => toDateStr(m.date) === toDateStr(date) && m.meal_type === mealType)
        if (!meal) meal = await get().getOrCreateDailyMeal(date, mealType)
        const current = meal?.skipped ?? get().skippedMeals[key] ?? false
        const next = !current
        set((state) => ({
          skippedMeals: { ...state.skippedMeals, [key]: next },
          // Atlandı işaretlenince Tamamlandı kaldırılır
          completedMeals: next ? { ...state.completedMeals, [key]: false } : state.completedMeals,
          dailyMeals: state.dailyMeals.map((m) =>
            m.id === meal.id ? { ...m, skipped: next, ...(next && { completed: false, completed_at: null }) } : m
          )
        }))
        if (isSupabaseConfigured()) {
          await supabase.from('daily_meals').update({
            skipped: next,
            ...(next && { completed: false, completed_at: null })
          }).eq('id', meal.id)
        }
      },
      setMealCompletedAt: async (date, mealType, time) => {
        const { dailyMeals } = get()
        const meal = dailyMeals.find(m => toDateStr(m.date) === toDateStr(date) && m.meal_type === mealType)
        if (!meal) return
        const value = time && /^\d{1,2}:\d{2}$/.test(time) ? time : null
        set((state) => ({
          dailyMeals: state.dailyMeals.map((m) => (m.id === meal.id ? { ...m, completed_at: value } : m))
        }))
        if (isSupabaseConfigured()) {
          await supabase.from('daily_meals').update({ completed_at: value }).eq('id', meal.id)
        }
      },

      // Meal Items
      mealItems: [],
      setMealItems: (items) => set({ mealItems: items }),

      // Water Logs
      waterLogs: [],
      setWaterLogs: (logs) => set({ waterLogs: logs }),
      // Hangi tarihlerde local update yapıldı (race condition önlemek için)
      _waterLocalUpdatedAt: {},

      // Weight Logs
      weightLogs: [],
      setWeightLogs: (logs) => set({ weightLogs: logs }),

      // Su ayarları (persist)
      waterTargetDefault: 8,
      setWaterTargetDefault: async (n) => {
        const val = Math.max(1, Math.min(99, Number(n) || 8))
        set({ waterTargetDefault: val })
        if (isSupabaseConfigured()) {
          await supabase.from('app_settings').upsert({ key: 'waterTargetDefault', value: val }, { onConflict: 'user_id,key' })
        }
      },
      waterGlassVolumeMl: 200,
      setWaterGlassVolumeMl: async (n) => {
        const val = Math.max(50, Math.min(500, Number(n) || 200))
        set({ waterGlassVolumeMl: val })
        if (isSupabaseConfigured()) {
          await supabase.from('app_settings').upsert({ key: 'waterGlassVolumeMl', value: val }, { onConflict: 'user_id,key' })
        }
      },

      // Hedef kilo
      weightTarget: null,
      setWeightTarget: async (v) => {
        const val = v === '' || v === null ? null : Math.max(0, Number(v))
        set({ weightTarget: val })
        if (isSupabaseConfigured()) {
          await supabase.from('app_settings').upsert({ key: 'weightTarget', value: val }, { onConflict: 'user_id,key' })
        }
      },

      // Gemini butonu URL'si
      geminiUrl: '',
      setGeminiUrl: (url) => set({ geminiUrl: url }),

      // Enerji Logları
      energyLogs: [],
      setEnergyLogs: (logs) => set({ energyLogs: logs }),

      addEnergyLog: async (timestamp, level) => {
        const ts = timestamp || new Date().toISOString()
        const date = ts.slice(0, 10)
        const newLog = { id: generateId(), timestamp: ts, date, level, created_at: new Date().toISOString() }
        set((state) => ({ energyLogs: [...state.energyLogs, newLog] }))
        if (isSupabaseConfigured()) {
          const { data: { user } } = await supabase.auth.getUser()
          const insertData = user ? { ...newLog, user_id: user.id } : newLog
          const { data, error } = await supabase.from('energy_logs').insert(insertData).select().single()
          if (error) console.error('Error adding energy log:', error)
          else set((state) => ({ energyLogs: state.energyLogs.map(l => l.id === newLog.id ? data : l) }))
        }
        return newLog
      },

      deleteEnergyLog: async (id) => {
        set((state) => ({ energyLogs: state.energyLogs.filter(l => l.id !== id) }))
        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('energy_logs').delete().eq('id', id)
          if (error) console.error('Error deleting energy log:', error)
        }
      },

      // Enerji bildirim aralığı (saniye)
      energyNotifIntervalSec: 30,
      setEnergyNotifIntervalSec: async (sec) => {
        const val = Math.max(10, Number(sec) || 30)
        set({ energyNotifIntervalSec: val })
        if (isSupabaseConfigured()) {
          await supabase.from('app_settings').upsert({ key: 'energyNotifIntervalSec', value: val }, { onConflict: 'user_id,key' })
        }
      },

      // Enerji bildirimleri toggle + saat aralığı
      energyNotifEnabled: false,
      setEnergyNotifEnabled: async (v) => {
        set({ energyNotifEnabled: v })
        if (isSupabaseConfigured()) {
          await supabase.from('app_settings').upsert({ key: 'energyNotifEnabled', value: v }, { onConflict: 'user_id,key' })
        }
      },
      energyNotifStart: '09:30',
      setEnergyNotifStart: async (v) => {
        set({ energyNotifStart: v })
        if (isSupabaseConfigured()) {
          await supabase.from('app_settings').upsert({ key: 'energyNotifStart', value: v }, { onConflict: 'user_id,key' })
        }
      },
      energyNotifEnd: '22:30',
      setEnergyNotifEnd: async (v) => {
        set({ energyNotifEnd: v })
        if (isSupabaseConfigured()) {
          await supabase.from('app_settings').upsert({ key: 'energyNotifEnd', value: v }, { onConflict: 'user_id,key' })
        }
      },

      // Loading state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Initialize data from Supabase
      initializeData: async () => {
        if (!isSupabaseConfigured()) {
          console.warn('Supabase not configured. Using local storage only.')
          return
        }

        const fetchStartedAt = Date.now()
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

          // energy_logs ayrı çek — tablo yoksa diğer verileri etkilemesin
          let energyLogs = null
          try {
            const { data: elData, error: elError } = await supabase
              .from('energy_logs').select('*').order('timestamp', { ascending: false })
            if (!elError) energyLogs = elData
            else console.warn('energy_logs fetch skipped:', elError.message)
          } catch (e) {
            console.warn('energy_logs fetch failed:', e)
          }

          // app_settings ayrı çek — tablo yoksa diğer verileri etkilemesin
          const { data: appSettings } = await supabase.from('app_settings').select('*')

          const migrateEx = (e) => {
            if (e.items && e.items.length > 0) return e
            if (e.equivalent_food_id) return { ...e, items: [{ equivalent_food_id: e.equivalent_food_id, quantity: e.quantity, unit_id: e.unit_id }] }
            return { ...e, items: [] }
          }

          const settingsMap = Object.fromEntries((appSettings || []).map(s => [s.key, s.value]))

          const { waterLogs: localWaterLogs, _waterLocalUpdatedAt } = get()
          const mergedWaterLogs = (waterLogs || []).map(remote => {
            const localTs = _waterLocalUpdatedAt?.[remote.date]
            // Bu fetch başladıktan SONRA local update yapıldıysa Supabase verisi stale — local'i koru
            if (localTs && localTs > fetchStartedAt) {
              return localWaterLogs.find(l => l.date === remote.date) || remote
            }
            return remote
          })

          const dm = dailyMeals || []
          const completedFromDb = Object.fromEntries(dm.filter((m) => m.completed).map((m) => [`${toDateStr(m.date)}_${m.meal_type}`, true]))
          const skippedFromDb = Object.fromEntries(dm.filter((m) => m.skipped).map((m) => [`${toDateStr(m.date)}_${m.meal_type}`, true]))

          set({
            units: (units?.length ? units : DEFAULT_UNITS),
            foods: foods || [],
            exchanges: (exchanges || []).map(migrateEx),
            recipes: recipes || [],
            recipeCategories: categories || [],
            dailyMeals: dm,
            completedMeals: completedFromDb,
            skippedMeals: skippedFromDb,
            mealItems: mealItems || [],
            waterLogs: mergedWaterLogs,
            weightLogs: weightLogs || [],
            energyLogs: energyLogs || [],
            ...(settingsMap.weightTarget !== undefined && { weightTarget: settingsMap.weightTarget }),
            ...(settingsMap.waterTargetDefault !== undefined && { waterTargetDefault: settingsMap.waterTargetDefault }),
            ...(settingsMap.waterGlassVolumeMl !== undefined && { waterGlassVolumeMl: settingsMap.waterGlassVolumeMl }),
            ...(settingsMap.energyNotifEnabled !== undefined && { energyNotifEnabled: settingsMap.energyNotifEnabled }),
            ...(settingsMap.energyNotifIntervalSec !== undefined && { energyNotifIntervalSec: settingsMap.energyNotifIntervalSec }),
            ...(settingsMap.energyNotifStart !== undefined && { energyNotifStart: settingsMap.energyNotifStart }),
            ...(settingsMap.energyNotifEnd !== undefined && { energyNotifEnd: settingsMap.energyNotifEnd })
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
          { name: 'food_exchanges', data: state.exchanges.map(e => {
            const firstItem = (e.items || [])[0] || {}
            return {
              ...e,
              equivalent_food_id: e.equivalent_food_id || firstItem.equivalent_food_id || null,
              quantity: e.quantity ?? firstItem.quantity ?? null,
              unit_id: e.unit_id || firstItem.unit_id || null
            }
          }), onConflict: 'id' },
          { name: 'recipes', data: state.recipes, onConflict: 'id' },
          { name: 'daily_meals', data: state.dailyMeals, onConflict: 'id' },
          { name: 'meal_items', data: state.mealItems, onConflict: 'id' },
          { name: 'water_logs', data: state.waterLogs, onConflict: 'user_id,date' },
          { name: 'weight_logs', data: state.weightLogs, onConflict: 'user_id,date' }
        ]
        for (const { name, data, onConflict } of tables) {
          if (!data?.length) continue
          const { error } = await supabase.from(name).upsert(data, { onConflict })
          if (error) throw new Error(`${name}: ${error.message}`)
        }

        // Ayarları da sync et
        const settingsToSync = [
          { key: 'weightTarget', value: state.weightTarget },
          { key: 'waterTargetDefault', value: state.waterTargetDefault },
          { key: 'waterGlassVolumeMl', value: state.waterGlassVolumeMl }
        ].filter(s => s.value !== null && s.value !== undefined)
        if (settingsToSync.length) {
          const { error } = await supabase.from('app_settings').upsert(settingsToSync, { onConflict: 'user_id,key' })
          if (error) console.error('app_settings sync error:', error)
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
          food_id: exchange.food_id,
          quantity_left: exchange.quantity_left ?? 1,
          left_unit_id: exchange.left_unit_id || null,
          items: exchange.items || [],
          id: generateId(),
          created_at: new Date().toISOString()
        }
        set((state) => ({ exchanges: [...state.exchanges, newExchange] }))

        if (isSupabaseConfigured()) {
          const firstItem = newExchange.items[0] || {}
          const supabaseExchange = {
            ...newExchange,
            equivalent_food_id: firstItem.equivalent_food_id || null,
            quantity: firstItem.quantity || null,
            unit_id: firstItem.unit_id || null
          }
          const { data, error } = await supabase.from('food_exchanges').insert(supabaseExchange).select().single()
          if (error) console.error('Error adding exchange:', error)
          else set((state) => ({ exchanges: state.exchanges.map(e => e.id === newExchange.id ? { ...data, items: newExchange.items } : e) }))
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

      updateRecipeCategory: async (id, updates) => {
        set((state) => ({
          recipeCategories: state.recipeCategories.map(c => c.id === id ? { ...c, ...updates } : c)
        }))
        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('recipe_categories').update(updates).eq('id', id)
          if (error) console.error('Error updating category:', error)
        }
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

        await get().addFood({ name: newRecipe.title, default_unit_id: null, recipe_id: newRecipe.id })

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

        if (updates.title) {
          const linkedFood = get().foods.find(f => f.recipe_id === id)
          if (linkedFood) await get().updateFood(linkedFood.id, { name: updates.title })
        }
      },

      deleteRecipe: async (id) => {
        const linkedFood = get().foods.find(f => f.recipe_id === id)
        if (linkedFood) await get().deleteFood(linkedFood.id)

        set((state) => ({ recipes: state.recipes.filter(r => r.id !== id) }))

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('recipes').delete().eq('id', id)
          if (error) console.error('Error deleting recipe:', error)
        }
      },

      // Daily Meals
      // Custom ara öğünler için sort_order şeması:
      // breakfast=10, lunch=30, snack=50, dinner=70
      // custom: after breakfast→20+, after lunch→40+, after snack→60+, after dinner→80+
      CUSTOM_MEAL_BASES: { breakfast: 20, lunch: 40, snack: 60, dinner: 80 },

      addCustomMeal: async (date, label, afterMealType) => {
        const bases = { breakfast: 20, lunch: 40, snack: 60, dinner: 80 }
        const base = bases[afterMealType] ?? 80
        const existing = get().dailyMeals.filter(m =>
          toDateStr(m.date) === toDateStr(date) && m.is_custom &&
          m.sort_order >= base && m.sort_order < base + 9
        )
        const sortOrder = base + existing.length
        const mealType = `custom_${generateId()}`
        const id = generateId()
        const newMeal = {
          id, date: toDateStr(date), meal_type: mealType,
          is_custom: true, label: label || 'Ara Öğün', sort_order: sortOrder,
          completed: false, completed_at: null, skipped: false,
          created_at: new Date().toISOString()
        }
        set(s => ({ dailyMeals: [...s.dailyMeals, newMeal] }))
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.from('daily_meals').insert(newMeal).select().single()
          if (error) console.error('Error adding custom meal:', error)
          else set(s => ({ dailyMeals: s.dailyMeals.map(m => m.id === id ? data : m) }))
        }
        return newMeal
      },

      deleteCustomMeal: async (date, mealType) => {
        const meal = get().dailyMeals.find(m => toDateStr(m.date) === toDateStr(date) && m.meal_type === mealType)
        if (!meal) return
        set(s => ({
          dailyMeals: s.dailyMeals.filter(m => !(toDateStr(m.date) === toDateStr(date) && m.meal_type === mealType)),
          mealItems: s.mealItems.filter(i => i.daily_meal_id !== meal.id)
        }))
        if (isSupabaseConfigured()) {
          await supabase.from('meal_items').delete().eq('daily_meal_id', meal.id)
          await supabase.from('daily_meals').delete().eq('id', meal.id)
        }
      },

      getOrCreateDailyMeal: async (date, mealType) => {
        const { dailyMeals } = get()
        const dateNorm = toDateStr(date)
        let meal = dailyMeals.find(m => toDateStr(m.date) === dateNorm && m.meal_type === mealType)

        if (!meal) {
          meal = { id: generateId(), date: dateNorm || date, meal_type: mealType, completed: false, completed_at: null, created_at: new Date().toISOString() }
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
        const now = Date.now()
        set((state) => ({
          waterLogs: state.waterLogs.map(l => l.date === date ? { ...l, ...updates } : l),
          _waterLocalUpdatedAt: { ...state._waterLocalUpdatedAt, [date]: now }
        }))

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('water_logs').update(updates).eq('date', date).select().single()
          if (error) {
            console.error('Error updating water log:', error)
          } else if (data) {
            // Supabase'den confirmed değeri yaz (dirty flag'i koruyoruz — initializeData timestamp karşılaştırması halleder)
            set((state) => ({
              waterLogs: state.waterLogs.map(l => l.date === date ? { ...l, ...data } : l)
            }))
          }
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

      // Eski tek-item exchange formatını yeni items[] formatına dönüştür
      _migrateExchange: (e) => {
        if (e.items && e.items.length > 0) return e
        if (e.equivalent_food_id) {
          return {
            ...e,
            items: [{ equivalent_food_id: e.equivalent_food_id, quantity: e.quantity, unit_id: e.unit_id }]
          }
        }
        return { ...e, items: [] }
      },

      // Get exchanges for a specific food (hem giden hem gelen / tersinir)
      getExchangesForFood: (foodId) => {
        const { exchanges, foods, units } = get()
        const migrate = get()._migrateExchange
        const getUnit = (id) => (id ? units.find(u => u.id === id) : null)
        const getFood = (id) => foods.find(f => f.id === id)
        const result = []

        exchanges.map(migrate).filter(e => e.food_id === foodId).forEach(e => {
          result.push({
            id: e.id,
            leftQuantity: e.quantity_left ?? 1,
            leftUnit: getUnit(e.left_unit_id),
            leftFood: getFood(e.food_id),
            rightItems: e.items.map(item => ({
              food: getFood(item.equivalent_food_id),
              quantity: item.quantity,
              unit: getUnit(item.unit_id)
            }))
          })
        })

        exchanges.map(migrate)
          .filter(e => e.items.some(item => item.equivalent_food_id === foodId))
          .forEach(e => {
            const matchingItem = e.items.find(item => item.equivalent_food_id === foodId)
            result.push({
              id: `${e.id}-rev`,
              leftQuantity: matchingItem.quantity,
              leftUnit: getUnit(matchingItem.unit_id),
              leftFood: getFood(matchingItem.equivalent_food_id),
              rightItems: [{
                food: getFood(e.food_id),
                quantity: e.quantity_left ?? 1,
                unit: getUnit(e.left_unit_id)
              }]
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
      },

      // Çıkış yapınca kullanıcı verilerini temizle
      importFromMaster: async () => {
        if (!isSupabaseConfigured()) throw new Error('Supabase yapılandırılmamış.')

        // Mevcut kullanıcının ID'sini al — trigger'a güvenmek yerine explicit set edeceğiz
        const { data: { session } } = await supabase.auth.getSession()
        const currentUserId = session?.user?.id
        if (!currentUserId) throw new Error('Oturum bulunamadı.')

        const { data, error } = await supabase.rpc('get_master_data')
        if (error) throw error

        const { foods, exchanges, recipes, recipeCategories } = get()
        const masterData = typeof data === 'string' ? JSON.parse(data) : data
        const masterCategories = masterData.categories || []
        const masterRecipes   = masterData.recipes    || []
        const masterFoods     = masterData.foods      || []
        const masterExchanges = masterData.exchanges  || []

        const catIdMap    = {}
        const recipeIdMap = {}
        const foodIdMap   = {}
        const now = new Date().toISOString()

        // 1. Kategoriler
        const newCats = []
        for (const cat of masterCategories) {
          const exists = recipeCategories.find(c => c.name === cat.name)
          if (exists) { catIdMap[cat.id] = exists.id; continue }
          const newId = generateId()
          catIdMap[cat.id] = newId
          const { user_id: _u, id: _id, created_at: _ca, ...catFields } = cat
          newCats.push({ ...catFields, id: newId, user_id: currentUserId, created_at: now })
        }
        if (newCats.length > 0) {
          const { error: catErr } = await supabase.from('recipe_categories').insert(newCats)
          if (catErr) throw new Error(`Kategori aktarım hatası: ${catErr.message}`)
          set(s => ({ recipeCategories: [...s.recipeCategories, ...newCats] }))
        }

        // 2. Tarifler
        const newRecipes = []
        for (const recipe of masterRecipes) {
          const exists = recipes.find(r => r.title === recipe.title)
          if (exists) { recipeIdMap[recipe.id] = exists.id; continue }
          const newId = generateId()
          recipeIdMap[recipe.id] = newId
          const { user_id: _u, id: _id, category_id: _c, created_at: _ca, ...recipeFields } = recipe
          newRecipes.push({
            ...recipeFields,
            id: newId,
            user_id: currentUserId,
            category_id: catIdMap[recipe.category_id] || null,
            created_at: now
          })
        }
        if (newRecipes.length > 0) {
          const { error: recErr } = await supabase.from('recipes').insert(newRecipes)
          if (recErr) throw new Error(`Tarif aktarım hatası: ${recErr.message}`)
          set(s => ({ recipes: [...s.recipes, ...newRecipes] }))
        }

        // 3. Besinler (recipe-bağlı olanlar dahil)
        const newFoods = []
        for (const food of masterFoods) {
          const exists = foods.find(f => f.name === food.name)
          if (exists) { foodIdMap[food.id] = exists.id; continue }
          const newId = generateId()
          foodIdMap[food.id] = newId
          const { user_id: _u, id: _id, recipe_id: _r, created_at: _ca, ...foodFields } = food
          newFoods.push({
            ...foodFields,
            id: newId,
            user_id: currentUserId,
            recipe_id: food.recipe_id ? (recipeIdMap[food.recipe_id] || null) : null,
            created_at: now
          })
        }
        if (newFoods.length > 0) {
          const { error: foodErr } = await supabase.from('foods').insert(newFoods)
          if (foodErr) throw new Error(`Besin aktarım hatası: ${foodErr.message}`)
          set(s => ({ foods: [...s.foods, ...newFoods] }))
        }

        // 4. Değişimler
        const newExchanges = []
        for (const ex of masterExchanges) {
          const mappedFoodId = foodIdMap[ex.food_id]
          if (!mappedFoodId) continue
          const remappedItems = (ex.items || []).map(item => ({
            ...item,
            equivalent_food_id: foodIdMap[item.equivalent_food_id] || item.equivalent_food_id
          }))
          const firstItem = remappedItems[0] || {}
          const newId = generateId()
          newExchanges.push({
            id: newId,
            user_id: currentUserId,
            food_id: mappedFoodId,
            quantity_left: ex.quantity_left ?? 1,
            left_unit_id: ex.left_unit_id || null,
            items: remappedItems,
            equivalent_food_id: firstItem.equivalent_food_id || null,
            quantity: firstItem.quantity || null,
            unit_id: firstItem.unit_id || null,
            created_at: now
          })
        }
        if (newExchanges.length > 0) {
          const { error: exErr } = await supabase.from('food_exchanges').insert(newExchanges)
          if (exErr) throw new Error(`Değişim aktarım hatası: ${exErr.message}`)
          set(s => ({ exchanges: [...s.exchanges, ...newExchanges] }))
        }

        return {
          categories: newCats.length,
          recipes: newRecipes.length,
          foods: newFoods.length,
          exchanges: newExchanges.length
        }
      },

      clearUserData: () => {
        set({
          foods: [],
          exchanges: [],
          recipes: [],
          recipeCategories: [],
          dailyMeals: [],
          mealItems: [],
          waterLogs: [],
          weightLogs: [],
          units: [...DEFAULT_UNITS],
          completedMeals: {},
          skippedMeals: {},
          waterTargetDefault: 8,
          waterGlassVolumeMl: 200,
          weightTarget: null,
          energyLogs: []
        })
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
        completedMeals: state.completedMeals,
        skippedMeals: state.skippedMeals,
        waterLogs: state.waterLogs,
        weightLogs: state.weightLogs,
        waterTargetDefault: state.waterTargetDefault,
        waterGlassVolumeMl: state.waterGlassVolumeMl,
        weightTarget: state.weightTarget,
        geminiUrl: state.geminiUrl,
        energyLogs: state.energyLogs,
        energyNotifIntervalSec: state.energyNotifIntervalSec,
        energyNotifEnabled: state.energyNotifEnabled,
        energyNotifStart: state.energyNotifStart,
        energyNotifEnd: state.energyNotifEnd
      }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        units: persisted?.units?.length ? persisted.units : (current.units || DEFAULT_UNITS),
        exchanges: (persisted?.exchanges || []).map(e => {
          if (e.items && e.items.length > 0) return e
          if (e.equivalent_food_id) {
            return {
              ...e,
              items: [{ equivalent_food_id: e.equivalent_food_id, quantity: e.quantity, unit_id: e.unit_id }]
            }
          }
          return { ...e, items: [] }
        })
      })
    }
  )
)

export default useAppStore
