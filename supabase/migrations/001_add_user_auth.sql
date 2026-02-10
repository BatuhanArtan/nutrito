-- Nutrito: Kullanıcı bazlı veri izolasyonu (Supabase Auth + RLS)
-- Supabase SQL Editor'da çalıştırın. Auth'u açtıktan sonra bu migration'ı uygulayın.

-- 1. user_id kolonlarını ekle (auth.users referansı)
ALTER TABLE units ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE foods ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE food_exchanges ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE recipe_categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE water_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE weight_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Unique constraint'leri kullanıcı bazlı yap (user_id dahil)
ALTER TABLE daily_meals DROP CONSTRAINT IF EXISTS daily_meals_date_meal_type_key;
ALTER TABLE daily_meals ADD CONSTRAINT daily_meals_user_date_meal_type_key UNIQUE (user_id, date, meal_type);

ALTER TABLE water_logs DROP CONSTRAINT IF EXISTS water_logs_date_key;
ALTER TABLE water_logs ADD CONSTRAINT water_logs_user_date_key UNIQUE (user_id, date);

ALTER TABLE weight_logs DROP CONSTRAINT IF EXISTS weight_logs_date_key;
ALTER TABLE weight_logs ADD CONSTRAINT weight_logs_user_date_key UNIQUE (user_id, date);

-- 3. Eski "Allow all" politikalarını kaldır
DROP POLICY IF EXISTS "Allow all access to units" ON units;
DROP POLICY IF EXISTS "Allow all access to foods" ON foods;
DROP POLICY IF EXISTS "Allow all access to food_exchanges" ON food_exchanges;
DROP POLICY IF EXISTS "Allow all access to recipe_categories" ON recipe_categories;
DROP POLICY IF EXISTS "Allow all access to recipes" ON recipes;
DROP POLICY IF EXISTS "Allow all access to daily_meals" ON daily_meals;
DROP POLICY IF EXISTS "Allow all access to meal_items" ON meal_items;
DROP POLICY IF EXISTS "Allow all access to water_logs" ON water_logs;
DROP POLICY IF EXISTS "Allow all access to weight_logs" ON weight_logs;

-- 4. Units: Sistem birimleri (user_id NULL) herkes okuyabilir; kendi birimlerini yönetir
CREATE POLICY "units_select" ON units FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "units_insert" ON units FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "units_update" ON units FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "units_delete" ON units FOR DELETE USING (user_id = auth.uid());

-- 5. Diğer tablolar: Sadece kendi satırları (INSERT'te trigger user_id set eder)
CREATE POLICY "foods_policy" ON foods FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "food_exchanges_policy" ON food_exchanges FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "recipe_categories_policy" ON recipe_categories FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "recipes_policy" ON recipes FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "daily_meals_policy" ON daily_meals FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "meal_items_policy" ON meal_items FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "water_logs_policy" ON water_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "weight_logs_policy" ON weight_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 6. INSERT için user_id otomatik set (trigger)
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_units_user_id BEFORE INSERT ON units FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_foods_user_id BEFORE INSERT ON foods FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_food_exchanges_user_id BEFORE INSERT ON food_exchanges FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_recipe_categories_user_id BEFORE INSERT ON recipe_categories FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_recipes_user_id BEFORE INSERT ON recipes FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_daily_meals_user_id BEFORE INSERT ON daily_meals FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_meal_items_user_id BEFORE INSERT ON meal_items FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_water_logs_user_id BEFORE INSERT ON water_logs FOR EACH ROW EXECUTE FUNCTION set_user_id();
CREATE TRIGGER set_weight_logs_user_id BEFORE INSERT ON weight_logs FOR EACH ROW EXECUTE FUNCTION set_user_id();

-- Not: Units tablosundaki varsayılan birimler (INSERT ile eklenen) user_id=NULL kalır; herkes okuyabilir.
